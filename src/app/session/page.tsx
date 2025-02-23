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

  // Format elapsedTime into hours, minutes, and seconds (with one decimal for seconds)
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = (elapsedTime % 60).toFixed(1).padStart(4, "0");

  const displayWindowSwitches = Math.max(
    windowSwitchCount - Math.floor(tabSwitchCount / 2),
    0
  );

  return (
    <div
      className={`min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black flex flex-col justify-between p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center transform origin-center ${
        isRunning && !isPaused ? "animate-breathing" : ""
      }`}
    >
      {/* Header */}
      <header className="relative text-center mb-6 z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          Lock In Session
        </h2>
        <p className="text-lg md:text-xl">
          Your focus timer is live. Stats are tracked only when your session is running.
        </p>
      </header>

      {/* Main Content (Timer, Input, and Controls) Centered */}
      <div className="relative flex-grow flex flex-col items-center justify-center z-10">
        {/* Duration Timer */}
        <div className="text-6xl md:text-7xl font-bold tracking-wider drop-shadow-2xl mb-4">
          {hours}:{minutes.toString().padStart(2, "0")}:{seconds}
        </div>

        {/* Task/Project Name Input */}
        <div className="mb-6 flex justify-center w-full">
          <input
            type="text"
            placeholder="Enter Task/Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full max-w-md p-3 rounded-lg border border-gray-700 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>

        {/* Control Buttons */}
        <div className="mb-4 flex flex-wrap justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={startSession}
              className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
            >
              Lock In
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-600 hover:bg-yellow-700 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
                >
                  Resume
                </button>
              )}
              <button
                onClick={() => {
                  pauseSession();
                  setShowVisibilityModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
              >
                Stop Session
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Stats (moved up slightly) */}
      <div className="relative max-w-4xl mx-auto mb-2 z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Tab Active Time</p>
            <p className="text-2xl font-bold">{tabActiveTime.toFixed(1)}s</p>
          </div>
          <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Tab Inactive Time</p>
            <p className="text-2xl font-bold">{tabInactiveTime.toFixed(1)}s</p>
          </div>
          <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Window Focus Time</p>
            <p className="text-2xl font-bold">{windowFocusTime.toFixed(1)}s</p>
          </div>
          <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Window Unfocus Time</p>
            <p className="text-2xl font-bold">{windowUnfocusTime.toFixed(1)}s</p>
          </div>
          <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Tab Switches</p>
            <p className="text-2xl font-bold">{tabSwitchCount}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-md">
            <p className="text-sm uppercase">Window Switches</p>
            <p className="text-2xl font-bold">{displayWindowSwitches}</p>
          </div>
        </div>

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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-20">
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl text-white w-full max-w-sm">
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
                className="bg-green-600 hover:bg-green-700 transition-colors px-4 py-2 rounded"
              >
                Public
              </button>
              <button
                onClick={() => {
                  stopSession(false);
                  setShowVisibilityModal(false);
                }}
                className="bg-gray-600 hover:bg-gray-700 transition-colors px-4 py-2 rounded"
              >
                Private
              </button>
              <button
                onClick={() => {
                  resumeSession();
                  setShowVisibilityModal(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes breathing {
          0% {
            transform: scale(1);
            filter: brightness(0.9);
          }
          50% {
            transform: scale(1.005);
            filter: brightness(1.2);
          }
          100% {
            transform: scale(1);
            filter: brightness(0.9);
          }
        }
        .animate-breathing {
          animation: breathing 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
