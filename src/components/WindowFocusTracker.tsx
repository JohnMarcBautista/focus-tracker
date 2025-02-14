"use client";

import { useState, useEffect } from "react";

export function WindowFocusTracker() {
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [focusTime, setFocusTime] = useState(0);
  const [unfocusTime, setUnfocusTime] = useState(0);
  const [windowSwitchCount, setWindowSwitchCount] = useState(0);
  let startTime = Date.now();

  useEffect(() => {
    const handleFocus = () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setUnfocusTime(prev => prev + elapsedTime);
      setWindowSwitchCount(prev => prev + 1);
      setIsWindowFocused(true);
      startTime = Date.now();
    };

    const handleBlur = () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setFocusTime(prev => prev + elapsedTime);
      setIsWindowFocused(false);
      startTime = Date.now();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

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
