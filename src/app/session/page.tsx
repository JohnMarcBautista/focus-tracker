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

  // Stats for page/tab/window usage (using fractional seconds)
  const [tabActiveTime, setTabActiveTime] = useState(0);
  const [tabInactiveTime, setTabInactiveTime] = useState(0);
  const [windowFocusTime, setWindowFocusTime] = useState(0);
  const [windowUnfocusTime, setWindowUnfocusTime] = useState(0);

  // Switch counts
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowSwitchCount, setWindowSwitchCount] = useState(0);

  // Timer logic for "duration" (in seconds)
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Whether trackers are running
  const [isRunning, setIsRunning] = useState(false);

  // Store the timestamp (in ms) of the last tab switch.
  const [lastTabSwitchTime, setLastTabSwitchTime] = useState(0);

  // Check user session on mount
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

  // START FOCUS SESSION
  const startFocusSession = () => {
    // Reset all usage stats
    setTabActiveTime(0);
    setTabInactiveTime(0);
    setWindowFocusTime(0);
    setWindowUnfocusTime(0);

    // Reset switch counts
    setTabSwitchCount(0);
    setWindowSwitchCount(0);

    // Reset duration and start the timer
    setElapsedTime(0);
    if (!intervalId) {
      const id = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(id);
    }

    // Activate the trackers
    setIsRunning(true);
  };

  // STOP FOCUS SESSION
  const stopFocusSession = async () => {
    const finalElapsedTime = elapsedTime;
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
  
    // Adjust window switch count: subtract one window switch per two tab switches
    const adjustedWindowSwitchCount = Math.max(
      windowSwitchCount - Math.floor(tabSwitchCount / 2),
      0
    );
  
    // Prepare stats with rounded values (or update your schema to accept fractions)
    const statsRow = {
      user_id: session?.user.id,
      duration: finalElapsedTime,
      tab_active_time: Math.floor(tabActiveTime),
      tab_inactive_time: Math.floor(tabInactiveTime),
      window_focus_time: Math.floor(windowFocusTime),
      window_unfocus_time: Math.floor(windowUnfocusTime),
      tab_switches: tabSwitchCount,
      window_switches: adjustedWindowSwitchCount,
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
  
    // Reset the trackers
    setTabActiveTime(0);
    setTabInactiveTime(0);
    setWindowFocusTime(0);
    setWindowUnfocusTime(0);
    setTabSwitchCount(0);
    setWindowSwitchCount(0);
    setElapsedTime(0);
  };
  

  if (!session) {
    return <p className="p-8">Loading or redirecting...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h2 className="text-3xl font-semibold mb-4 text-black">
        Focus Session Page
      </h2>
      <p className="mb-6 text-black">
        Stats are tracked only when session is running.
      </p>

      {!isRunning ? (
        <button
          onClick={startFocusSession}
          className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg mb-6"
        >
          Start Focus Session
        </button>
      ) : (
        <button
          onClick={stopFocusSession}
          className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg mb-6"
        >
          Stop Session
        </button>
      )}

      <div className="space-y-2 text-black mb-6">
        <div>Tab Active Time: {tabActiveTime.toFixed(1)}s</div>
        <div>Tab Inactive Time: {tabInactiveTime.toFixed(1)}s</div>
        <div>Window Focus Time: {windowFocusTime.toFixed(1)}s</div>
        <div>Window Unfocus Time: {windowUnfocusTime.toFixed(1)}s</div>
        <div>Tab Switches: {tabSwitchCount}</div>
        <div>Window Switches: {Math.max(windowSwitchCount - Math.floor(tabSwitchCount / 2), 0)}</div>
      </div>

      <div className="text-4xl font-bold text-black mb-6">
        {Math.floor(elapsedTime / 60)}:
        {String(elapsedTime % 60).padStart(2, "0")}
      </div>

      {/* Pass onTabSwitch callback to TabTracker to update lastTabSwitchTime */}
      <TabTracker
        isRunning={isRunning}
        onUpdateActive={setTabActiveTime}
        onUpdateInactive={setTabInactiveTime}
        onUpdateSwitches={setTabSwitchCount}
        onTabSwitch={(time) => setLastTabSwitchTime(time)}
      />

      {/* Pass lastTabSwitchTime into WindowFocusTracker */}
      <WindowFocusTracker
        isRunning={isRunning}
        onUpdateFocus={setWindowFocusTime}
        onUpdateUnfocus={setWindowUnfocusTime}
        onUpdateSwitches={setWindowSwitchCount}
        lastTabSwitchTime={lastTabSwitchTime}
      />
    </div>
  );
}
