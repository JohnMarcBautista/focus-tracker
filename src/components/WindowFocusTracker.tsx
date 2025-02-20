"use client";

import { useState, useEffect, useRef } from "react";

interface WindowFocusTrackerProps {
  isRunning: boolean;
  onUpdateFocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateUnfocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateSwitches: React.Dispatch<React.SetStateAction<number>>;
  lastTabSwitchTime?: number; // new prop: timestamp of last tab switch
}

export function WindowFocusTracker({
  isRunning,
  onUpdateFocus,
  onUpdateUnfocus,
  onUpdateSwitches,
  lastTabSwitchTime = 0,
}: WindowFocusTrackerProps) {
  const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());
  const [focusTimeMs, setFocusTimeMs] = useState(0);
  const [unfocusTimeMs, setUnfocusTimeMs] = useState(0);
  const [windowSwitchCount, setWindowSwitchCount] = useState(0);

  const startTimeRef = useRef(performance.now());
  const wasFocusedRef = useRef<boolean>(document.hasFocus());
  const switchCountRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      wasFocusedRef.current = document.hasFocus();
      switchCountRef.current = 0;
      setWindowSwitchCount(0);
      setIsWindowFocused(document.hasFocus());
      measureChunk();

      const interval = setInterval(() => {
        measureChunk();
      }, 100);

      return () => clearInterval(interval);
    } else {
      measureChunk();
    }
  }, [isRunning]);

  // Update with fractional seconds.
  const measureChunk = () => {
    const now = performance.now();
    const elapsedMs = now - startTimeRef.current;
    if (elapsedMs <= 0) return;

    if (wasFocusedRef.current) {
      setFocusTimeMs((prev) => prev + elapsedMs);
      onUpdateFocus((p) => p + elapsedMs / 1000);
    } else {
      setUnfocusTimeMs((prev) => prev + elapsedMs);
      onUpdateUnfocus((p) => p + elapsedMs / 1000);
    }
    startTimeRef.current = now;
  };

  useEffect(() => {
    if (!isRunning) return;

    const THRESHOLD_MS = 500; // time within which we consider the event a result of a tab switch

    const handleFocus = () => {
      if (!isRunning) return;
      measureChunk();

      // If this focus event happens shortly after a tab switch, ignore it.
      if (performance.now() - lastTabSwitchTime < THRESHOLD_MS) {
        setIsWindowFocused(true);
        wasFocusedRef.current = true;
        startTimeRef.current = performance.now();
        return;
      }
      if (!wasFocusedRef.current && !document.hidden) {
        switchCountRef.current += 1;
        setWindowSwitchCount(switchCountRef.current);
        onUpdateSwitches((prev) => prev + 1);
      }
      setIsWindowFocused(true);
      wasFocusedRef.current = true;
      startTimeRef.current = performance.now();
    };

    const handleBlur = () => {
      measureChunk();
      setTimeout(() => {
        // If blur happens due to a tab switch, document.hidden will be true.
        if (document.hidden || performance.now() - lastTabSwitchTime < THRESHOLD_MS) return;
        switchCountRef.current += 1;
        setWindowSwitchCount(switchCountRef.current);
        onUpdateSwitches((prev) => prev + 1);
        setIsWindowFocused(false);
        wasFocusedRef.current = false;
        startTimeRef.current = performance.now();
      }, 0);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isRunning, lastTabSwitchTime, onUpdateSwitches]);

  useEffect(() => {
    if (isRunning) {
      onUpdateSwitches(windowSwitchCount);
    }
  }, [windowSwitchCount, isRunning, onUpdateSwitches]);

  return (
    <div className="text-black">
      <p className="text-black">
        Window Focused: {isWindowFocused ? "✅ Yes" : "❌ No"}
      </p>
    </div>
  );
}
