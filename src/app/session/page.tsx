"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TabTracker } from "@/components/TabTracker";
import { WindowFocusTracker } from "@/components/WindowFocusTracker";
import { Session } from "@supabase/supabase-js";
import { useSession } from "@/contexts/SessionContext";

export default function SessionPage() {
  const router = useRouter();
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  // Destructure session tracking state and functions from the context.
  const {
    isRunning,
    isPaused,
    elapsedTime,
    tabActiveTime,
    setTabActiveTime,
    tabInactiveTime,
    setTabInactiveTime,
    windowFocusTime,
    setWindowFocusTime,
    windowUnfocusTime,
    setWindowUnfocusTime,
    tabSwitchCount,
    setTabSwitchCount,
    windowSwitchCount,
    setWindowSwitchCount,
    projectName,
    lastTabSwitchTime,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    setProjectName,
    setLastTabSwitchTime,
    setIsTabActive,
    setIsWindowFocused,
    // Also get setUserId from the context.
    setUserId,
  } = useSession();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.replace("/auth/login");
        return;
      }
      setAuthSession(data.session);
      // Save the authenticated user's ID in the global session context.
      setUserId(data.session.user.id);
    };
    checkSession();
  }, [router, setUserId]);

  if (!authSession) {
    return <p className="p-8">Loading or redirecting...</p>;
  }

  // Format elapsedTime into minutes and seconds (with one decimal)
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = (elapsedTime % 60).toFixed(1).padStart(4, "0");

  // Compute adjusted window switch count for display.
  const displayWindowSwitches = Math.max(
    windowSwitchCount - Math.floor(tabSwitchCount / 2),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between p-8">
      {/* Top Section: Header, Timer, Task/Project Input, and Control Buttons */}
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
            onClick={startSession}
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
            {/* When stopping the session, pause it first and show the modal */}
            <button
              onClick={() => {
                pauseSession();
                setShowVisibilityModal(true);
              }}
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

      {/* Bottom Section: Status, Detailed Stats, and Tracker Components */}
      <div className="w-full">
        {/* Status row */}
        <div className="flex justify-around mb-4 text-black">
          <p>Tab Active: {"✅"}</p>
          <p>Window Focused: {"✅"}</p>
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

        {/* Render Tracker Components */}
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

      {/* Modal to select public/private visibility with Cancel option */}
      {showVisibilityModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg text-black max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Share Your Session</h3>
            <p className="mb-4">
              Would you like to make your session public so others can see your stats, or keep it private?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => {
                  stopSession(true);
                  setShowVisibilityModal(false);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Public
              </button>
              <button
                onClick={() => {
                  stopSession(false);
                  setShowVisibilityModal(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Private
              </button>
              <button
                onClick={() => {
                  resumeSession();
                  setShowVisibilityModal(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
