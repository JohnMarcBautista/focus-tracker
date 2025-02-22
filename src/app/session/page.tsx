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
      setUserId(data.session.user.id);
    };
    checkSession();
  }, [router, setUserId]);

  if (!authSession) {
    return <p className="p-8 text-center text-xl">Loading or redirecting...</p>;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex flex-col justify-between p-8 text-white">
      {/* Top Section */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
          Lock In Session
        </h2>
        <p className="text-lg md:text-xl mb-8">
          Your focus timer is live. Stats are tracked only when your session is running.
        </p>
        {/* Project Input */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Enter Task/Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full max-w-md p-3 rounded-lg border border-gray-300 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* Control Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={startSession}
              className="bg-green-500 hover:bg-green-600 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
            >
              Lock In
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-500 hover:bg-yellow-600 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="bg-blue-500 hover:bg-blue-600 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
                >
                  Resume
                </button>
              )}
              <button
                onClick={() => {
                  pauseSession();
                  setShowVisibilityModal(true);
                }}
                className="bg-red-500 hover:bg-red-600 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
              >
                Stop Session
              </button>
            </>
          )}
        </div>
        {/* Timer Display */}
        <div className="text-6xl md:text-7xl font-bold tracking-wider drop-shadow-2xl mb-8">
          {minutes}:{seconds}
        </div>
      </div>

      {/* Bottom Section: Stats & Tracker Components */}
      <div className="max-w-4xl mx-auto">
        {/* Status Row */}
        <div className="flex justify-around mb-8 text-lg">
          <p>Tab Active: <span className="font-semibold">✅</span></p>
          <p>Window Focused: <span className="font-semibold">✅</span></p>
        </div>
        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-indigo-700 bg-opacity-50 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Tab Active Time</p>
            <p className="text-2xl font-bold">{tabActiveTime.toFixed(1)}s</p>
          </div>
          <div className="bg-indigo-700 bg-opacity-50 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Tab Inactive Time</p>
            <p className="text-2xl font-bold">{tabInactiveTime.toFixed(1)}s</p>
          </div>
          <div className="bg-indigo-700 bg-opacity-50 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Window Focus Time</p>
            <p className="text-2xl font-bold">{windowFocusTime.toFixed(1)}s</p>
          </div>
          <div className="bg-indigo-700 bg-opacity-50 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Window Unfocus Time</p>
            <p className="text-2xl font-bold">{windowUnfocusTime.toFixed(1)}s</p>
          </div>
          <div className="bg-indigo-700 bg-opacity-50 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Tab Switches</p>
            <p className="text-2xl font-bold">{tabSwitchCount}</p>
          </div>
          <div className="bg-indigo-700 bg-opacity-50 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Window Switches</p>
            <p className="text-2xl font-bold">{displayWindowSwitches}</p>
          </div>
        </div>

        {/* Tracker Components */}
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

      {/* Modal for Session Visibility */}
      {showVisibilityModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-black w-full max-w-sm">
            <h3 className="text-2xl font-bold mb-4">Share Your Session</h3>
            <p className="mb-6">
              Would you like to make your session public so others can see your stats, or keep it private?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  stopSession(true);
                  setShowVisibilityModal(false);
                }}
                className="bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded"
              >
                Public
              </button>
              <button
                onClick={() => {
                  stopSession(false);
                  setShowVisibilityModal(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 transition-colors px-4 py-2 rounded"
              >
                Private
              </button>
              <button
                onClick={() => {
                  resumeSession();
                  setShowVisibilityModal(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded"
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
