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
  // We no longer render UI from this component, so we use these setters only.
  const [, setIsTabActive] = useState(!document.hidden);
  const [, setActiveTimeMs] = useState(0);
  const [, setInactiveTimeMs] = useState(0);
  const [, setTabSwitchCount] = useState(0);

  const startTimeRef = useRef(performance.now());
  const wasTabActiveRef = useRef<boolean>(!document.hidden);
  const switchCountRef = useRef(0);

  // Memoize measureChunk so we can add it to dependencies
  const measureChunk = useCallback(() => {
    const now = performance.now();
    const elapsedMs = now - startTimeRef.current;
    if (elapsedMs <= 0) return;
    if (wasTabActiveRef.current) {
      setActiveTimeMs((prev) => prev + elapsedMs);
      onUpdateActive((p) => p + elapsedMs / 1000);
    } else {
      setInactiveTimeMs((prev) => prev + elapsedMs);
      onUpdateInactive((p) => p + elapsedMs / 1000);
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
