"use client";

import { useState, useEffect } from "react";

export function TabTracker() {
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [activeTime, setActiveTime] = useState(0);
  const [inactiveTime, setInactiveTime] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  let startTime = Date.now();

  useEffect(() => {
    const handleVisibilityChange = () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

      if (document.hidden) {
        setInactiveTime(prev => prev + elapsedTime);
        setTabSwitchCount(prev => prev + 1);
      } else {
        setActiveTime(prev => prev + elapsedTime);
      }

      setIsTabActive(!document.hidden);
      startTime = Date.now();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
