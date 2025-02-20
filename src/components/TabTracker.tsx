"use client";

import { useState, useEffect, useRef } from "react";

interface TabTrackerProps {
  isRunning: boolean;
  onUpdateActive: React.Dispatch<React.SetStateAction<number>>;
  onUpdateInactive: React.Dispatch<React.SetStateAction<number>>;
  onUpdateSwitches: React.Dispatch<React.SetStateAction<number>>;
  onTabSwitch?: (time: number) => void; // new prop: receives timestamp of tab switch
}

export function TabTracker({
  isRunning,
  onUpdateActive,
  onUpdateInactive,
  onUpdateSwitches,
  onTabSwitch,
}: TabTrackerProps) {
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [activeTimeMs, setActiveTimeMs] = useState(0);
  const [inactiveTimeMs, setInactiveTimeMs] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const startTimeRef = useRef(performance.now());
  const wasTabActiveRef = useRef<boolean>(!document.hidden);
  const switchCountRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      wasTabActiveRef.current = !document.hidden;
      setIsTabActive(!document.hidden);
      measureChunk(); // Ensure no startup lag

      const interval = setInterval(() => {
        measureChunk();
      }, 100);

      return () => clearInterval(interval);
    } else {
      measureChunk();
    }
  }, [isRunning]);

  // Update with fractional seconds for smoother UI updates.
  const measureChunk = () => {
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
  };

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
        // Notify parent of a tab switch with the current timestamp.
        onTabSwitch && onTabSwitch(performance.now());
      }

      setIsTabActive(newActiveState);
      wasTabActiveRef.current = newActiveState;
      startTimeRef.current = performance.now();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, onTabSwitch, onUpdateSwitches]);

  return (
    <div className="text-black">
      <p className="text-black">Tab Active: {isTabActive ? "✅ Yes" : "❌ No"}</p>
    </div>
  );
}
