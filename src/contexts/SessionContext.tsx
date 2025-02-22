"use client";

import { createContext, useContext, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

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
  startSession: () => void;
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
  const [isTabActive, setIsTabActive] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // new state for user ID

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    // Reset all stats
    setTabActiveTime(0);
    setTabInactiveTime(0);
    setWindowFocusTime(0);
    setWindowUnfocusTime(0);
    setTabSwitchCount(0);
    setWindowSwitchCount(0);
    setElapsedTime(0);
    setIsPaused(false);
    setIsRunning(true);

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);
    }
  };

  const pauseSession = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resumeSession = () => {
    setIsPaused(false);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);
    }
  };

  const stopSession = async (isPublic: boolean) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);

    const adjustedWindowSwitchCount = Math.max(
      windowSwitchCount - Math.floor(tabSwitchCount / 2),
      0
    );

    const statsRow = {
      user_id: userId, // include the authenticated user's ID
      duration: Math.floor(elapsedTime),
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

    console.log("Inserting stats row:", statsRow);

    const { error } = await supabase.from("focus_sessions").insert(statsRow);
    if (error) {
      console.error("Error uploading session stats:", error.message);
    } else {
      alert("Focus session ended! Stats uploaded.");
    }

    // Reset stats after stopping.
    setTabActiveTime(0);
    setTabInactiveTime(0);
    setWindowFocusTime(0);
    setWindowUnfocusTime(0);
    setTabSwitchCount(0);
    setWindowSwitchCount(0);
    setElapsedTime(0);
    setProjectName("");
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
    userId, // new
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    setProjectName,
    setUserId, // new
    setTabActiveTime,
    setTabInactiveTime,
    setWindowFocusTime,
    setWindowUnfocusTime,
    setTabSwitchCount,
    setWindowSwitchCount,
    setLastTabSwitchTime,
    setIsTabActive,
    setIsWindowFocused,
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
