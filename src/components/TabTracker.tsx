"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TabTrackerProps {
  isRunning: boolean;
  onUpdateActive: React.Dispatch<React.SetStateAction<number>>;
  onUpdateInactive: React.Dispatch<React.SetStateAction<number>>;
  onUpdateSwitches: React.Dispatch<React.SetStateAction<number>>;
  onTabSwitch?: (time: number) => void; // receives timestamp of tab switch
  onUpdateActiveState?: (isActive: boolean) => void; // callback for active state
}

export function TabTracker({
  isRunning,
  onUpdateActive,
  onUpdateInactive,
  onUpdateSwitches,
  onTabSwitch,
  onUpdateActiveState,
}: TabTrackerProps) {
  // Initialize with safe defaults.
  const [, setIsTabActive] = useState(false);
  const [, setActiveTimeMs] = useState(0);
  const [, setInactiveTimeMs] = useState(0);
  const [, setTabSwitchCount] = useState(0);

  const startTimeRef = useRef(performance.now());
  const wasTabActiveRef = useRef(false);
  const switchCountRef = useRef(0);

  // On mount, update initial state using document.
  useEffect(() => {
    const currentActive = !document.hidden;
    setIsTabActive(currentActive);
    wasTabActiveRef.current = currentActive;
  }, []);

  // Memoize measureChunk so it's stable in dependencies.
  const measureChunk = useCallback(() => {
    const now = performance.now();
    const elapsedMs = now - startTimeRef.current;
    if (elapsedMs <= 0) return;

    if (wasTabActiveRef.current) {
      setActiveTimeMs((prev) => prev + elapsedMs);
      onUpdateActive((prev) => prev + elapsedMs / 1000);
    } else {
      setInactiveTimeMs((prev) => prev + elapsedMs);
      onUpdateInactive((prev) => prev + elapsedMs / 1000);
    }
    startTimeRef.current = now;
  }, [onUpdateActive, onUpdateInactive]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      wasTabActiveRef.current = !document.hidden;
      setIsTabActive(!document.hidden);
      onUpdateActiveState?.(!document.hidden);
      measureChunk(); // Ensure no startup lag

      const interval = setInterval(() => {
        measureChunk();
      }, 100);

      return () => clearInterval(interval);
    } else {
      measureChunk();
    }
  }, [isRunning, onUpdateActiveState, measureChunk]);

  useEffect(() => {
    if (!isRunning) return;

    const handleVisibilityChange = () => {
      if (!isRunning) return;
      measureChunk();

      // Determine the new active state.
      const newActiveState = !document.hidden;
      if (newActiveState !== wasTabActiveRef.current) {
        switchCountRef.current += 1;
        setTabSwitchCount(switchCountRef.current);
        onUpdateSwitches(switchCountRef.current);
        if (onTabSwitch) {
          onTabSwitch(performance.now());
        }
      }

      setIsTabActive(newActiveState);
      onUpdateActiveState?.(newActiveState);
      wasTabActiveRef.current = newActiveState;
      startTimeRef.current = performance.now();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, onTabSwitch, onUpdateSwitches, onUpdateActiveState, measureChunk]);

  return null;
}
