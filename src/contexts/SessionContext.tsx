"use client";

import { createContext, useContext, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { gameConfig } from '@/config/gameConfig';

interface SessionContextType {
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number;
  tabActiveTime: number;
  tabInactiveTime: number;
  windowFocusTime: number;
  windowUnfocusTime: number;
  tabSwitchCount: number;
  windowSwitchCount: number;
  projectName: string;
  lastTabSwitchTime: number;
  userId: string | null; // new: stores the authenticated user's ID
  startSession: (duration: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: (isPublic: boolean) => Promise<void>;
  setProjectName: (name: string) => void;
  setUserId: (id: string | null) => void; // new setter for userId
  setTabActiveTime: React.Dispatch<React.SetStateAction<number>>;
  setTabInactiveTime: React.Dispatch<React.SetStateAction<number>>;
  setWindowFocusTime: React.Dispatch<React.SetStateAction<number>>;
  setWindowUnfocusTime: React.Dispatch<React.SetStateAction<number>>;
  setTabSwitchCount: React.Dispatch<React.SetStateAction<number>>;
  setWindowSwitchCount: React.Dispatch<React.SetStateAction<number>>;
  setLastTabSwitchTime: React.Dispatch<React.SetStateAction<number>>;
  setIsTabActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWindowFocused: React.Dispatch<React.SetStateAction<boolean>>;
  showVisibilityModal: boolean;
  setShowVisibilityModal: React.Dispatch<React.SetStateAction<boolean>>;
  setElapsedTime: React.Dispatch<React.SetStateAction<number>>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tabActiveTime, setTabActiveTime] = useState(0);
  const [tabInactiveTime, setTabInactiveTime] = useState(0);
  const [windowFocusTime, setWindowFocusTime] = useState(0);
  const [windowUnfocusTime, setWindowUnfocusTime] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowSwitchCount, setWindowSwitchCount] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [lastTabSwitchTime, setLastTabSwitchTime] = useState(0);
  const [, setIsTabActive] = useState(false);
  const [, setIsWindowFocused] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  // Refs for timestamp-based elapsed time tracking.
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  // Add initial duration ref
  const initialDurationRef = useRef<number>(0);

  const calculateDistanceGained = (duration: number): number => {
    let sessionType: "10sec" | "10min" | "30min" | "1hour";
    
    if (duration <= 10) sessionType = "10sec";
    else if (duration <= 600) sessionType = "10min";
    else if (duration <= 1800) sessionType = "30min";
    else sessionType = "1hour";

    const { baseSpeed, multiplier } = gameConfig.spaceship;
    return baseSpeed[sessionType] * multiplier;
  };

  const updatePlanetProgress = (totalDistance: number, currentPlanets: number, planetHistory: string[]) => {
    const { milestones } = gameConfig;
    let newPlanetsReached = currentPlanets;
    let newPlanetHistory = [...planetHistory];

    // Check each milestone in order
    for (let i = currentPlanets; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (totalDistance >= milestone.distance) {
        newPlanetsReached++;
        newPlanetHistory.push(milestone.name);
      } else {
        break; // Stop checking if we haven't reached the next milestone
      }
    }

    return {
      planets_reached: newPlanetsReached,
      planet_history: newPlanetHistory
    };
  };

  const startSession = (duration: number) => {
    setTabActiveTime(0);
    setTabInactiveTime(0);
    setWindowFocusTime(0);
    setWindowUnfocusTime(0);
    setTabSwitchCount(0);
    setWindowSwitchCount(0);
    
    // Store the initial duration
    initialDurationRef.current = duration;
    setElapsedTime(duration);
    setIsRunning(true);
    setIsPaused(false);

    // Set exact start time and initial duration
    const startTime = Date.now();
    startTimeRef.current = startTime;
    accumulatedTimeRef.current = duration;
    setElapsedTime(duration);

    if (timerId) {
      clearInterval(timerId);
    }

    const timer = setInterval(() => {
      if (!isPaused && startTimeRef.current) {
        const now = Date.now();
        const elapsedMs = now - startTime;
        const remainingTime = Math.max(0, duration - elapsedMs / 1000);
        
        // Round to 1 decimal but handle exact zero properly
        const displayTime = remainingTime < 0.1 ? 0 : Math.round(remainingTime * 10) / 10;
        setElapsedTime(displayTime);
        
        // Check for completion exactly at zero
        if (remainingTime <= 0) {
          clearInterval(timer);
          setTimerId(null);
          setIsPaused(true);
          setShowVisibilityModal(true);
        }
      }
    }, 50); // Reduced interval for smoother updates

    setTimerId(timer);
  };

  const pauseSession = () => {
    setIsPaused(true);
    if (startTimeRef.current) {
      accumulatedTimeRef.current = elapsedTime;
      startTimeRef.current = null;
    }
  };

  const resumeSession = () => {
    // Don't allow resume if visibility modal is shown
    if (showVisibilityModal) return;
    
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const stopSession = async (isPublic: boolean) => {
    // Clear timers
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    
    // Stop the session
    setIsRunning(false);
    setIsPaused(false);

    const adjustedWindowSwitchCount = Math.max(
      windowSwitchCount - Math.floor(tabSwitchCount / 2),
      0
    );

    // Calculate actual duration and check if session was completed
    const actualDuration = Math.floor(initialDurationRef.current - elapsedTime);
    const sessionCompleted = elapsedTime <= 0;
    
    // Only award distance if session was completed
    const distanceGained = sessionCompleted ? 
      calculateDistanceGained(initialDurationRef.current) : 
      0;

    try {
      // Log the data we're about to insert
      const sessionData = {
        user_id: userId,
        duration: actualDuration,
        distance_gained: distanceGained,
        tab_active_time: Math.floor(tabActiveTime),
        tab_inactive_time: Math.floor(tabInactiveTime),
        window_focus_time: Math.floor(windowFocusTime),
        window_unfocus_time: Math.floor(windowUnfocusTime),
        tab_switches: tabSwitchCount,
        window_switches: adjustedWindowSwitchCount,
        project_name: projectName,
        is_public: isPublic,
        created_at: new Date().toISOString(),
      };

      console.log("Attempting to insert session with data:", sessionData);

      // Try the insert without .select().single() first
      const { error: sessionError } = await supabase
        .from("focus_sessions")
        .insert(sessionData);

      if (sessionError) {
        console.error("Session insert error details:", {
          error: sessionError,
          code: sessionError.code,
          message: sessionError.message,
          details: sessionError.details
        });
        throw new Error(`Failed to insert session: ${sessionError.message}`);
      }

      // Only update progress if distance was gained (session completed)
      if (distanceGained > 0) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          console.error("Error fetching user progress:", progressError);
          return;
        }

        const { baseSpeed, model } = gameConfig.spaceship;
        const newTotalDistance = progressData ? 
          progressData.total_distance + distanceGained : 
          distanceGained;

        // Calculate new planet progress
        const planetProgress = updatePlanetProgress(
          newTotalDistance,
          progressData?.planets_reached || 0,
          progressData?.planet_history || []
        );

        const newProgress = progressData ? {
          total_distance: newTotalDistance,
          current_speed: baseSpeed[initialDurationRef.current <= 600 ? "10min" : initialDurationRef.current <= 1800 ? "30min" : "1hour"],
          rocket_model: model,
          last_updated: new Date().toISOString(),
          ...planetProgress  // Add updated planet progress
        } : {
          user_id: userId,
          total_distance: newTotalDistance,
          planets_reached: planetProgress.planets_reached,
          planet_history: planetProgress.planet_history,
          current_speed: baseSpeed[initialDurationRef.current <= 600 ? "10min" : initialDurationRef.current <= 1800 ? "30min" : "1hour"],
          rocket_model: model,
          last_updated: new Date().toISOString(),
        };

        // Modified upsert operation
        if (progressData) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('user_progress')
            .update(newProgress)
            .eq('user_id', userId);

          if (updateError) {
            console.error("Error updating user progress:", updateError);
            return;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('user_progress')
            .insert(newProgress);

          if (insertError) {
            console.error("Error inserting user progress:", insertError);
            return;
          }
        }
      }

      alert("Focus session ended! Stats uploaded.");
    } catch (error: any) {
      console.error("Full error object:", error);
      console.error("Error in session handling:", {
        error,
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert(`Error saving session: ${error.message || 'Unknown error occurred'}`);
    } finally {
      // Reset all stats
      setTabActiveTime(0);
      setTabInactiveTime(0);
      setWindowFocusTime(0);
      setWindowUnfocusTime(0);
      setTabSwitchCount(0);
      setWindowSwitchCount(0);
      setElapsedTime(0);
      setProjectName("");
    }
  };

  const value: SessionContextType = {
    isRunning,
    isPaused,
    elapsedTime,
    tabActiveTime,
    tabInactiveTime,
    windowFocusTime,
    windowUnfocusTime,
    tabSwitchCount,
    windowSwitchCount,
    projectName,
    lastTabSwitchTime,
    userId,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    setProjectName,
    setUserId,
    setTabActiveTime,
    setTabInactiveTime,
    setWindowFocusTime,
    setWindowUnfocusTime,
    setTabSwitchCount,
    setWindowSwitchCount,
    setLastTabSwitchTime,
    setIsTabActive,
    setIsWindowFocused,
    showVisibilityModal,
    setShowVisibilityModal,
    setElapsedTime,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
