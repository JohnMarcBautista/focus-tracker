export const dynamic = "force-dynamic";

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TabTracker } from "@/components/TabTracker";
import { WindowFocusTracker } from "@/components/WindowFocusTracker";
import { Session } from "@supabase/supabase-js";

export default function SessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  // Stats for usage (fractional seconds)
  const [tabActiveTime, setTabActiveTime] = useState(0);
  const [tabInactiveTime, setTabInactiveTime] = useState(0);
  const [windowFocusTime, setWindowFocusTime] = useState(0);
  const [windowUnfocusTime, setWindowUnfocusTime] = useState(0);

  // Switch counts
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowSwitchCount, setWindowSwitchCount] = useState(0);

  // Timer for overall session duration (in seconds, fractional)
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Whether session is running and paused
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Last tab switch timestamp
  const [lastTabSwitchTime, setLastTabSwitchTime] = useState(0);

  // Lifted status state for display
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());

  // New state for Task/Project Name
  const [projectName, setProjectName] = useState("");

  // New state to show visibility modal
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.replace("/auth/login");
        return;
      }
      setSession(data.session);
    };
    checkSession();
  }, [router]);

  const startFocusSession = () => {
    // Reset all stats and state
    setTabActiveTime(0);
    setTabInactiveTime(0);
    setWindowFocusTime(0);
    setWindowUnfocusTime(0);
    setTabSwitchCount(0);
    setWindowSwitchCount(0);
    setElapsedTime(0);
    setIsPaused(false);
    setIsRunning(true);

    // Start the overall timer with 100ms interval
    if (!intervalId) {
      const id = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);
      setIntervalId(id);
    }
  };

  const pauseSession = () => {
    setIsPaused(true);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resumeSession = () => {
    setIsPaused(false);
    if (!intervalId) {
      const id = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);
      setIntervalId(id);
    }
  };

  // When the user clicks "Stop Session," clear the timer and show the modal.
  const stopFocusSession = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
    setIsPaused(false);
    // Show the modal to ask for public/private choice.
    setShowVisibilityModal(true);
  };

  // Called when the user confirms whether the session should be public.
  const confirmStopSession = async (isPublic: boolean) => {
    // Adjust window switch count: subtract one window switch per two tab switches.
    const adjustedWindowSwitchCount = Math.max(
      windowSwitchCount - Math.floor(tabSwitchCount / 2),
      0
    );

    const statsRow = {
      user_id: session?.user.id,
      duration: Math.floor(elapsedTime), // convert to integer seconds
      tab_active_time: Math.floor(tabActiveTime),
      tab_inactive_time: Math.floor(tabInactiveTime),
      window_focus_time: Math.floor(windowFocusTime),
      window_unfocus_time: Math.floor(windowUnfocusTime),
      tab_switches: tabSwitchCount,
      window_switches: adjustedWindowSwitchCount,
      project_name: projectName,
      is_public: isPublic, // new field for visibility
      created_at: new Date().toISOString(),
    };

    console.log("Inserting stats row:", statsRow);

    const { error } = await supabase.from("focus_sessions").insert(statsRow);

    if (error) {
      console.error("🔴 Error uploading session stats:", error.message);
    } else {
      console.log("✅ Session stats uploaded:", statsRow);
      alert("Focus session ended! Stats uploaded.");
    }

    // Reset all stats and input fields
    setTabActiveTime(0);
    setTabInactiveTime(0);
    setWindowFocusTime(0);
    setWindowUnfocusTime(0);
    setTabSwitchCount(0);
    setWindowSwitchCount(0);
    setElapsedTime(0);
    setProjectName("");
    setShowVisibilityModal(false);
  };

  if (!session) {
    return <p className="p-8">Loading or redirecting...</p>;
  }

  // Compute adjusted window switch count for display.
  const displayWindowSwitches = Math.max(
    windowSwitchCount - Math.floor(tabSwitchCount / 2),
    0
  );

  // Format elapsedTime into minutes and seconds (with one decimal)
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = (elapsedTime % 60).toFixed(1).padStart(4, "0");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between p-8">
      {/* Top Section: Header, Large Timer, Task/Project Input, and Control Buttons */}
      <div>
        <h2 className="text-3xl font-semibold mb-4 text-black">
          Lock In Session Page
        </h2>
        <p className="mb-6 text-black">
          Stats are tracked only when session is running.
        </p>
        {/* Input for Task/Project Name */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Task/Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full max-w-xs text-black"
          />
        </div>
        {!isRunning ? (
          <button
            onClick={startFocusSession}
            className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg mb-6"
          >
            Lock In
          </button>
        ) : (
          <div className="mb-6">
            {!isPaused ? (
              <button
                onClick={pauseSession}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg text-lg mr-4"
              >
                Pause Session
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg mr-4"
              >
                Resume Session
              </button>
            )}
            <button
              onClick={stopFocusSession}
              className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg"
            >
              Stop Session
            </button>
          </div>
        )}

        <div className="text-4xl font-bold text-black mb-6">
          {minutes}:{seconds}
        </div>
      </div>

      {/* Bottom Section: Status, Small Timers, and Tracker Components */}
      <div className="w-full">
        {/* Status row above the small timers */}
        <div className="flex justify-around mb-4 text-black">
          <p>Tab Active: {isTabActive ? "✅ Yes" : "❌ No"}</p>
          <p>Window Focused: {isWindowFocused ? "✅ Yes" : "❌ No"}</p>
        </div>

        {/* Detailed stats grid */}
        <div className="grid grid-cols-2 gap-4 text-black mb-6">
          <div>Tab Active Time: {tabActiveTime.toFixed(1)}s</div>
          <div>Tab Inactive Time: {tabInactiveTime.toFixed(1)}s</div>
          <div>Window Focus Time: {windowFocusTime.toFixed(1)}s</div>
          <div>Window Unfocus Time: {windowUnfocusTime.toFixed(1)}s</div>
          <div>Tab Switches: {tabSwitchCount}</div>
          <div>Window Switches: {displayWindowSwitches}</div>
        </div>

        {/* Tracker components (update state without rendering UI) */}
        <TabTracker
          isRunning={isRunning && !isPaused}
          onUpdateActive={setTabActiveTime}
          onUpdateInactive={setTabInactiveTime}
          onUpdateSwitches={setTabSwitchCount}
          onTabSwitch={(time) => setLastTabSwitchTime(time)}
          onUpdateActiveState={setIsTabActive}
        />
        <WindowFocusTracker
          isRunning={isRunning && !isPaused}
          onUpdateFocus={setWindowFocusTime}
          onUpdateUnfocus={setWindowUnfocusTime}
          onUpdateSwitches={setWindowSwitchCount}
          lastTabSwitchTime={lastTabSwitchTime}
          onUpdateFocusState={setIsWindowFocused}
        />
      </div>

      {/* Modal to select public/private visibility */}
      {showVisibilityModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg text-black max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Share Your Session</h3>
            <p className="mb-4">
              Would you like to make your session public so others can see your stats,
              or keep it private?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => confirmStopSession(true)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Public
              </button>
              <button
                onClick={() => confirmStopSession(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Private
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
