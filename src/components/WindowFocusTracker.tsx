"use client";

import { useState, useEffect, useRef } from "react";

interface WindowFocusTrackerProps {
  isRunning: boolean;
  onUpdateFocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateUnfocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateSwitches: React.Dispatch<React.SetStateAction<number>>;
}

export function WindowFocusTracker({
  isRunning,
  onUpdateFocus,
  onUpdateUnfocus,
  onUpdateSwitches,
}: WindowFocusTrackerProps) {
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [focusTime, setFocusTime] = useState(0);
  const [unfocusTime, setUnfocusTime] = useState(0);
  const [windowSwitchCount, setWindowSwitchCount] = useState(0);

  const startTimeRef = useRef(Date.now());
  const wasFocusedRef = useRef<boolean>(true);

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Start/stop 1s interval for real-time updates
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      wasFocusedRef.current = true; // assume user is in focus at start
      setIsWindowFocused(true);

      intervalIdRef.current = setInterval(() => {
        measureChunk();
      }, 1000);
    } else {
      // session end
      measureChunk();
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isRunning]);

  // measure leftover chunk each second or on end
  const measureChunk = () => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    if (elapsed <= 0) return;

    if (wasFocusedRef.current) {
      // we were in focus
      setFocusTime((prev) => prev + elapsed);
      setTimeout(() => onUpdateFocus((p) => p + elapsed), 0);
    } else {
      // we were unfocused
      setUnfocusTime((prev) => prev + elapsed);
      setTimeout(() => onUpdateUnfocus((p) => p + elapsed), 0);
    }
    startTimeRef.current = now;
  };

  // handle focus/blur for window-level switches
  useEffect(() => {
    if (!isRunning) return;

    const handleFocus = () => {
      if (!isRunning) return;
      // measure leftover from the previous state
      measureChunk();

      // only count a "window switch" if doc.hidden === false
      // i.e. user didn't just switch tabs but truly came from another app
      if (document.hidden === false && wasFocusedRef.current === false) {
        // user is re-focusing entire window
        setWindowSwitchCount((prev) => {
          const newVal = prev + 1;
          setTimeout(() => onUpdateSwitches((p) => p + 1), 0);
          return newVal;
        });
      }

      setIsWindowFocused(true);
      wasFocusedRef.current = true;
      startTimeRef.current = Date.now();
    };

    const handleBlur = () => {
      if (!isRunning) return;
      measureChunk();

      // if doc.hidden is false here, it means user truly switched apps
      // if doc.hidden is true, that means they might have switched tabs instead
      if (document.hidden === false && wasFocusedRef.current === true) {
        // we count an app-level switch
        setWindowSwitchCount((prev) => {
          const newVal = prev + 1;
          setTimeout(() => onUpdateSwitches((p) => p + 1), 0);
          return newVal;
        });
      }

      setIsWindowFocused(false);
      wasFocusedRef.current = false;
      startTimeRef.current = Date.now();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isRunning, onUpdateSwitches]);

  return (
    <div>
      <h2>Window Focus Statistics</h2>
      <p>Window Focused: {isWindowFocused ? "✅ Yes" : "❌ No"}</p>
      <p>Total Focus Time: {focusTime} sec</p>
      <p>Total Unfocus Time: {unfocusTime} sec</p>
      <p>Window Switches: {windowSwitchCount}</p>
    </div>
  );
}

