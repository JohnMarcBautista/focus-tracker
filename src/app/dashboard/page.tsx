"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  type LeaderboardEntry = {
    user_id: string;
    email: string;
    total: number;
  };
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth");
      } else {
        setSession(data.session);
        fetchTotalFocusTime(data.session.user.id);
        fetchLeaderboard(); // ✅ Fetch leaderboard on load
      }
    };
    

    checkSession();
  }, [router]);

  // ✅ Fetch total focus time for the logged-in user
  const fetchTotalFocusTime = async (userId: string) => {
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*") // ✅ Fetch ALL columns to check what is being returned
      .eq("user_id", userId);
  
    console.log("🟡 Fetched Raw focus_sessions data:", data); // ✅ Debug Log
  
    if (error) {
      console.error("🔴 Error fetching total focus time:", error.message);
      return;
    }
  
    if (!data || data.length === 0) {
      console.log("⚠️ No focus sessions found for this user.");
      setTotalFocusTime(0);
      return;
    }
  
    const total = data.reduce((sum, session) => sum + (session.duration ?? 0), 0);
  
    console.log("🟢 Total Lifetime Focus Time:", total);
    setTotalFocusTime(total);
  };
  
  
  
  
  

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("user_id, duration")
      .order("duration", { ascending: false });
  
    console.log("🟡 Raw focus_sessions data for leaderboard:", data); // ✅ Debug Log
  
    if (error) {
      console.error("🔴 Error fetching leaderboard:", error.message);
      return;
    }
  
    if (!data || data.length === 0) {
      console.log("⚠️ No leaderboard data available.");
      setLeaderboard([]);
      return;
    }
  
    // ✅ Aggregate focus time per user
    const aggregatedData: Record<string, number> = {};
    data.forEach((entry) => {
      aggregatedData[entry.user_id] = (aggregatedData[entry.user_id] || 0) + (entry.duration ?? 0);
    });
  
    console.log("🟢 Aggregated Leaderboard Data:", aggregatedData);
  
    // ✅ Fetch user emails separately
    const usersData: LeaderboardEntry[] = await Promise.all(
      Object.keys(aggregatedData).map(async (userId) => {
        const { data: user, error: userError } = await supabase
          .from("auth.users")
          .select("email")
          .eq("id", userId)
          .single();
  
        return {
          user_id: userId,
          email: user?.email || "Unknown",
          total: aggregatedData[userId] ?? 0,
        };
      })
    );
  
    console.log("🟢 Final Leaderboard Data:", usersData);
    setLeaderboard(usersData);
  };
  
  


  // ✅ Start Timer
  const startTimer = () => {
    if (!isRunning) {
      const id = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(id);
      setIsRunning(true);
    }
  };

  const stopTimer = async () => {
    if (!isRunning || elapsedTime <= 0) return; // ✅ Prevent saving 0 or negative time
  
    if (intervalId) {
      clearInterval(intervalId); // ✅ Fix TypeScript error
      setIntervalId(null);
    }
  
    setIsRunning(false);
  
    if (session?.user) {
      console.log("🟢 Saving session for user:", session.user.id, "Duration:", elapsedTime);
  
      const { error } = await supabase
        .from("focus_sessions")
        .insert([{ user_id: session.user.id, duration: elapsedTime }]);
  
      if (error) {
        console.error("🔴 Error inserting focus session:", error.message);
      } else {
        console.log("✅ Focus session saved successfully!");
      }
    }
  
    setElapsedTime(0);
  };
  
  
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="text-xl font-bold">Focus Tracker</h1>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-semibold mb-4 text-black">
          Welcome, {session?.user.email}
        </h2>

        {/* ✅ Show Total Focus Time */}
        <div className="text-xl font-semibold text-black mb-6">
         Total Focus Time: 
         <span className="text-green-600"> {Math.floor(totalFocusTime / 3600)}:
            {String(Math.floor((totalFocusTime % 3600) / 60)).padStart(2, "0")}:
            {String(totalFocusTime % 60).padStart(2, "0")}
        </span>
        </div>


        {/* ✅ Focus Timer Leaderboard Display */}
        <div className="mt-8 w-full max-w-md bg-white shadow-md p-4 rounded-md">
  <h3 className="text-xl font-semibold mb-4 text-black">Leaderboard</h3>
  <ul>
    {leaderboard.length === 0 ? (
      <p className="text-gray-500">No leaderboard data yet.</p>
    ) : (
      leaderboard.map((user, index) => (
        <li key={user.user_id} className="flex justify-between text-black border-b py-2">
          <span className="font-medium">
            #{index + 1} {user.email}
          </span>
          <span className="text-green-600">
            {Math.floor(user.total / 3600)}:
            {String(Math.floor((user.total % 3600) / 60)).padStart(2, "0")}:
            {String(user.total % 60).padStart(2, "0")}
          </span>
        </li>
      ))
    )}
  </ul>
</div>


        {/* ✅ Focus Timer Display */}
        <div className="text-4xl font-bold text-black mb-6">
          {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
        </div>

        {/* ✅ Start/Stop Timer Buttons */}
        <div className="space-x-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg"
            >
              Start Focus Session
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg"
            >
              Stop Session
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
