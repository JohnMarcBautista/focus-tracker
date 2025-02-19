"use client";

import { useState, useEffect, useRef } from "react";

interface TabTrackerProps {
  isRunning: boolean;
  onUpdateActive: React.Dispatch<React.SetStateAction<number>>;
  onUpdateInactive: React.Dispatch<React.SetStateAction<number>>;
  onUpdateSwitches: React.Dispatch<React.SetStateAction<number>>;
}

export function TabTracker({
  isRunning,
  onUpdateActive,
  onUpdateInactive,
  onUpdateSwitches,
}: TabTrackerProps) {
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [activeTime, setActiveTime] = useState(0);
  const [inactiveTime, setInactiveTime] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const startTimeRef = useRef(Date.now());
  const wasTabActiveRef = useRef<boolean>(!document.hidden);

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Start/stop 1s interval
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      wasTabActiveRef.current = !document.hidden;
      setIsTabActive(!document.hidden);

      intervalIdRef.current = setInterval(() => {
        measureChunk();
      }, 1000);
    } else {
      // session stops
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

  // measure leftover each second or on session end
  const measureChunk = () => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    if (elapsed <= 0) return;

    if (wasTabActiveRef.current) {
      setActiveTime((prev) => prev + elapsed);
      setTimeout(() => onUpdateActive((p) => p + elapsed), 0);
    } else {
      setInactiveTime((prev) => prev + elapsed);
      setTimeout(() => onUpdateInactive((p) => p + elapsed), 0);
    }

    startTimeRef.current = now;
  };

  // detect visibility changes for tab switches
  useEffect(() => {
    if (!isRunning) return;

    const handleVisibilityChange = () => {
      // measure leftover for previous state
      measureChunk();

      if (!document.hidden && wasTabActiveRef.current === false) {
        // user is going from hidden -> visible, doesn't necessarily increment tab switch
        // up to you if you want to count this as a "switch" from inactive -> active
      } else if (document.hidden && wasTabActiveRef.current === true) {
        // user is going from visible -> hidden => tab switch
        setTabSwitchCount((prev) => {
          const newVal = prev + 1;
          setTimeout(() => onUpdateSwitches((p) => p + 1), 0);
          return newVal;
        });
      }

      setIsTabActive(!document.hidden);
      wasTabActiveRef.current = !document.hidden;
      startTimeRef.current = Date.now();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, onUpdateSwitches]);

  return (
    <div>
      <h2>Tab Statistics</h2>
      <p>Tab Active: {isTabActive ? "✅ Yes" : "❌ No"}</p>
      <p>Total Active Time: {activeTime} sec</p>
      <p>Total Inactive Time: {inactiveTime} sec</p>
      <p>Tab Switches: {tabSwitchCount}</p>
    </div>
  );
}
