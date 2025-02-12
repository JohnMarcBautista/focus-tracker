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
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
            router.replace("/auth"); // ✅ Redirects if not authenticated
            return;
        }

        setSession(data.session);

        // ✅ Ensure `session.user.id` exists before calling fetchTotalFocusTime
        if (data.session.user?.id) {
            fetchTotalFocusTime(data.session.user.id);
        }
    };

    checkSession();
}, [router]);









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

  const ensureAuthenticatedUser = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      return null;
    }
  
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return null;
    }
  
    return userData.user;
  };
  
  

  const stopTimer = async () => {
    if (isRunning && intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
        setIsRunning(false);

        if (!session?.user) return;

        // ✅ Insert new focus session
        await supabase
            .from("focus_sessions")
            .insert([{ user_id: session.user.id, duration: elapsedTime }]);

        // ✅ Get total time from focus_sessions
        const { data: totalData, error: totalError } = await supabase
            .from("focus_sessions")
            .select("duration")
            .eq("user_id", session.user.id);

        if (totalError) return;

        const totalTime = totalData.reduce((sum, session) => sum + session.duration, 0);

        setTotalFocusTime(totalTime);
    }

    setElapsedTime(0);
};


const fetchTotalFocusTime = async (user_id: string) => {
    if (!user_id) {
        console.error("🔴 No user ID provided.");
        return;
    }

    const { data, error } = await supabase.rpc("get_total_focus_time", { uid: user_id });

    if (error) {
        console.error("🔴 Error fetching total focus time:", error.message);
        return;
    }

    setTotalFocusTime(Number(data) || 0);
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

        {/* ✅ Focus Timer Display */}
        <div className="text-4xl font-bold text-black mb-6">
          {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
        </div>
{/* ✅ Leaderboard page button */}
        <button onClick={() => router.push("/leaderboard")}
    className="bg-green-500 text-white px-4 py-2 rounded-lg mt-6">
    View Leaderboard
</button>

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
