"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    console.log(`🟢 User navigated to: ${pathname}`);

    const startTime = Date.now();

    return () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setTotalTime(prev => prev + elapsedTime);
      console.log(`⏳ User spent ${elapsedTime} seconds on ${pathname}`);
    };
  }, [pathname]);

  return (
    <div>
      <h2>Page Statistics</h2>
      <p>Time Spent on This Page: {totalTime} sec</p>
    </div>
  );
}
