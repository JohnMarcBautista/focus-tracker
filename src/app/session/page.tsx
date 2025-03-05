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
  const [selectedDuration, setSelectedDuration] = useState<number>(0); // Duration in seconds

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
    setElapsedTime,
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

  // Format remaining time into hours, minutes, and seconds
  const formatTime = (timeInSeconds: number) => {
    // Round up to nearest second for display
    const roundedSeconds = Math.ceil(timeInSeconds);
    
    const hours = Math.floor(roundedSeconds / 3600);
    const minutes = Math.floor((roundedSeconds % 3600) / 60);
    const seconds = Math.floor(roundedSeconds % 60).toString().padStart(2, "0");
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(elapsedTime);

  // Update duration options to include test option
  const durationOptions = [
    { label: "10 seconds", value: 10 },  // Test option
    { label: "10 minutes", value: 600 },
    { label: "30 minutes", value: 1800 },
    { label: "1 hour", value: 3600 },
  ];

  // Modified start session handler
  const handleStartSession = () => {
    if (selectedDuration > 0) {
      startSession(selectedDuration);
    }
  };

  // Modified duration selection handler
  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    // Update the display time immediately
    setElapsedTime(duration);
  };

  const displayWindowSwitches = Math.max(
    windowSwitchCount - Math.floor(tabSwitchCount / 2),
    0
  );

  return (
    <div
      className={`min-h-screen relative bg-[url('/backgrounds/milky.jpg')] bg-cover bg-center flex flex-col items-center justify-between p-8 text-white transform origin-center ${
        isRunning && !isPaused ? "animate-breathing" : ""
      }`}
    >
      {/* Header */}
      <header className="relative text-center mb-6 z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          Session
        </h2>
      </header>

      {/* Main Content */}
      <div className="relative flex-grow flex flex-col items-center justify-center z-10">
        {/* Duration Selection */}
        {!isRunning && (
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDurationSelect(option.value)}
                className={`px-6 py-3 rounded-full text-lg transition-colors ${
                  selectedDuration === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 bg-opacity-50 hover:bg-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Timer Display */}
        <div className="mb-10">
          <div className="text-6xl md:text-8xl font-light tracking-widest drop-shadow-xl">
            {hours}:{minutes}:{seconds}
          </div>
        </div>

        {/* Project Name Input */}
        <div className="mb-10 w-full">
          <input
            type="text"
            placeholder="Enter Project Name..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-700 bg-gray-100 bg-opacity-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Control Buttons */}
        <div className="mb-4 flex flex-wrap justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStartSession}
              disabled={selectedDuration === 0}
              className={`px-8 py-3 rounded-full text-xl shadow-lg ${
                selectedDuration === 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 transition-colors"
              }`}
            >
              Lock In
            </button>
          ) : elapsedTime <= 0 ? (
            // Show Complete button when timer reaches zero
            <button
              onClick={() => setShowVisibilityModal(true)}
              className="bg-purple-600 hover:bg-purple-700 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
            >
              Complete
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
                onClick={() => setShowVisibilityModal(true)}
                className="bg-red-600 hover:bg-red-700 transition-colors px-8 py-3 rounded-full text-xl shadow-lg"
              >
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Stats: Organized in 2 Rows, 3 Columns, and Nudged Higher */}
      <div className="relative max-w-4xl mx-auto mt-2 z-10">
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-300">
          {/* Column 1: Tab Active above Tab Inactive */}
          <div className="flex flex-col items-center">
            <p className="uppercase">Tab Active</p>
            <p className="text-lg font-semibold">{tabActiveTime.toFixed(1)}s</p>
            <p className="uppercase mt-1">Tab Inactive</p>
            <p className="text-lg font-semibold">{tabInactiveTime.toFixed(1)}s</p>
          </div>
          {/* Column 2: Window Focus above Window Unfocus */}
          <div className="flex flex-col items-center">
            <p className="uppercase">Window Focus</p>
            <p className="text-lg font-semibold">{windowFocusTime.toFixed(1)}s</p>
            <p className="uppercase mt-1">Window Unfocus</p>
            <p className="text-lg font-semibold">{windowUnfocusTime.toFixed(1)}s</p>
          </div>
          {/* Column 3: Tab Switches above Window Switches */}
          <div className="flex flex-col items-center">
            <p className="uppercase">Tab Switches</p>
            <p className="text-lg font-semibold">{tabSwitchCount}</p>
            <p className="uppercase mt-1">Window Switches</p>
            <p className="text-lg font-semibold">{displayWindowSwitches}</p>
          </div>
        </div>
      </div>

      {/* Tracker Components */}
      <div className="relative w-full z-10">
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
          <div className="bg-gray-900 bg-opacity-90 p-8 rounded-xl shadow-2xl text-white w-full max-w-sm text-center">
            <h3 className="text-2xl font-bold mb-4">Share Your Session</h3>
            <p className="mb-6">
              Would you like to make your session public so others can see your stats, or keep it private?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  stopSession(true);
                  setShowVisibilityModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-3 rounded-full text-white"
              >
                Public
              </button>
              <button
                onClick={() => {
                  stopSession(false);
                  setShowVisibilityModal(false);
                }}
                className="bg-gray-600 hover:bg-gray-700 transition-colors px-6 py-3 rounded-full text-white"
              >
                Private
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes breathing {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-breathing {
          animation: breathing 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
