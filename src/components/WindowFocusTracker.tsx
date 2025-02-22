"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface WindowFocusTrackerProps {
  isRunning: boolean;
  onUpdateFocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateUnfocus: React.Dispatch<React.SetStateAction<number>>;
  onUpdateSwitches: React.Dispatch<React.SetStateAction<number>>;
  lastTabSwitchTime?: number; // timestamp of last tab switch
  onUpdateFocusState?: (isFocused: boolean) => void; // callback for focus state
}

export function WindowFocusTracker({
  isRunning,
  onUpdateFocus,
  onUpdateUnfocus,
  onUpdateSwitches,
  lastTabSwitchTime = 0,
  onUpdateFocusState,
}: WindowFocusTrackerProps) {
  // Initialize state safely without referencing document
  const [, setIsWindowFocused] = useState(false);
  const [, setFocusTimeMs] = useState(0);
  const [, setUnfocusTimeMs] = useState(0);
  // Removed local windowSwitchCount state.

  const startTimeRef = useRef(performance.now());
  const wasFocusedRef = useRef(false);
  // We'll keep a ref to detect consecutive switch events, but no local state.
  const switchCountRef = useRef(0);

  // On mount, update the initial focus state (client-side only)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const currentFocus = document.hasFocus();
      setIsWindowFocused(currentFocus);
      wasFocusedRef.current = currentFocus;
    }
  }, []);

  // Memoize measureChunk so it is stable across renders.
  const measureChunk = useCallback(() => {
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
  }, [onUpdateFocus, onUpdateUnfocus]);

  useEffect(() => {
    if (!isRunning) return;
    if (typeof document === "undefined") return;

    startTimeRef.current = performance.now();
    wasFocusedRef.current = document.hasFocus();
    setIsWindowFocused(document.hasFocus());
    onUpdateFocusState?.(document.hasFocus());
    measureChunk();

    const interval = setInterval(() => {
      measureChunk();
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, onUpdateFocusState, measureChunk]);

  useEffect(() => {
    if (!isRunning) return;
    if (typeof document === "undefined") return;

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
  }, [isRunning, lastTabSwitchTime, onUpdateSwitches, onUpdateFocusState, measureChunk]);

  // Removed effects that were resetting or syncing local windowSwitchCount.

  return null;
}
