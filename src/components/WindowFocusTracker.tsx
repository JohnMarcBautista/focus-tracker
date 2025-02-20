"use client";

import { useState, useEffect, useRef } from "react";

interface WindowFocusTrackerProps {
  isRunning: boolean;
  onUpdateFocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateUnfocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateSwitches: React.Dispatch<React.SetStateAction<number>>;
  lastTabSwitchTime?: number; // timestamp of last tab switch
  onUpdateFocusState?: (isFocused: boolean) => void; // new callback for focus state
}

export function WindowFocusTracker({
  isRunning,
  onUpdateFocus,
  onUpdateUnfocus,
  onUpdateSwitches,
  lastTabSwitchTime = 0,
  onUpdateFocusState,
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
      onUpdateFocusState?.(document.hasFocus());
      measureChunk();

      const interval = setInterval(() => {
        measureChunk();
      }, 100);

      return () => clearInterval(interval);
    } else {
      measureChunk();
    }
  }, [isRunning, onUpdateFocusState]);

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
    const THRESHOLD_MS = 500; // adjust as needed

    const handleFocus = () => {
      if (!isRunning) return;
      measureChunk();

      // If focus happens shortly after a tab switch, ignore counting it.
      if (performance.now() - lastTabSwitchTime < THRESHOLD_MS) {
        setIsWindowFocused(true);
        onUpdateFocusState?.(true);
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
      onUpdateFocusState?.(true);
      wasFocusedRef.current = true;
      startTimeRef.current = performance.now();
    };

    const handleBlur = () => {
      measureChunk();
      setTimeout(() => {
        if (document.hidden || performance.now() - lastTabSwitchTime < THRESHOLD_MS)
          return;
        switchCountRef.current += 1;
        setWindowSwitchCount(switchCountRef.current);
        onUpdateSwitches((prev) => prev + 1);
        setIsWindowFocused(false);
        onUpdateFocusState?.(false);
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
  }, [isRunning, lastTabSwitchTime, onUpdateSwitches, onUpdateFocusState]);

  useEffect(() => {
    if (isRunning) {
      onUpdateSwitches(windowSwitchCount);
    }
  }, [windowSwitchCount, isRunning, onUpdateSwitches]);

  // Do not render internal UI.
  return null;
}
