"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import WeeklyActivityChart from "@/components/WeeklyActivityChart";

// Define the interface for activity data.
interface ActivityData {
  day: string;
  total_duration: number;
}

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [averageFocusTime, setAverageFocusTime] = useState<number>(0);
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityData[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/auth");
        return;
      }

      setSession(data.session);

      if (data.session.user?.id) {
        const userId = data.session.user.id;
        fetchTotalFocusTime(userId);
        fetchSessionCount(userId);
        fetchAverageFocusTime(userId);
        fetchWeeklyActivity(userId);
        fetchCurrentStreak(userId);
      }
    };

    checkSession();
  }, [router]);

  const fetchTotalFocusTime = async (user_id: string) => {
    const { data, error } = await supabase.rpc("get_total_focus_time", { uid: user_id });
    if (error) {
      console.error("Error fetching total focus time:", error.message);
      return;
    }
    setTotalFocusTime(Number(data) || 0);
  };

  const fetchSessionCount = async (user_id: string) => {
    const { data, error } = await supabase.rpc("get_session_count", { uid: user_id });
    if (error) {
      console.error("Error fetching session count:", error.message);
      return;
    }
    setSessionCount(Number(data) || 0);
  };

  const fetchAverageFocusTime = async (user_id: string) => {
    const { data, error } = await supabase.rpc("get_average_focus_time", { uid: user_id });
    if (error) {
      console.error("Error fetching average focus time:", error.message);
      return;
    }
    setAverageFocusTime(Number(data) || 0);
  };

  const fetchWeeklyActivity = async (user_id: string) => {
    const { data, error } = await supabase.rpc("get_weekly_activity", { uid: user_id });
    if (error) {
      console.error("Error fetching weekly activity:", error.message);
      return;
    }
    // Cast the data to ActivityData[] to satisfy TypeScript.
    const formattedData: ActivityData[] = data
      ? (data as ActivityData[]).map((item) => ({
          day: item.day,
          total_duration: Number(item.total_duration) || 0,
        }))
      : [];
    setWeeklyActivity(formattedData);
  };

  const fetchCurrentStreak = async (user_id: string) => {
    const { data, error } = await supabase.rpc("get_current_streak", { uid: user_id });
    if (error) {
      console.error("Error fetching current streak:", error.message);
      return;
    }
    setStreak(Number(data) || 0);
  };

  const formatTime = (timeInSec: number) => {
    const hrs = Math.floor(timeInSec / 3600);
    const mins = Math.floor((timeInSec % 3600) / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <header className="w-full p-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
          Welcome, {session?.user.user_metadata.display_name || session?.user.email}
        </h2>
        <div className="mt-4 space-y-2">
          <div className="text-2xl md:text-3xl font-semibold">
            Total Focus Time: <span className="text-blue-500">{formatTime(totalFocusTime)}</span>
          </div>
          <div className="text-lg md:text-xl">
            Sessions Completed: <span className="text-blue-500">{sessionCount}</span>
          </div>
          <div className="text-lg md:text-xl">
            Average Session: <span className="text-blue-500">{formatTime(averageFocusTime)}</span>
          </div>
          <div className="text-lg md:text-xl">
            Current Streak: <span className="text-blue-500">{streak} day{streak === 1 ? "" : "s"}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-xl mb-8">
          <WeeklyActivityChart data={weeklyActivity} />
        </div>
      </main>

      <footer className="w-full p-4 flex justify-center">
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/leaderboard")}
            className="bg-white bg-opacity-80 hover:bg-opacity-90 transition-colors px-4 py-2 rounded-full text-sm shadow-md text-gray-900"
          >
            View Leaderboard
          </button>
          <button
            onClick={() => router.push("/session")}
            className="bg-white bg-opacity-80 hover:bg-opacity-90 transition-colors px-4 py-2 rounded-full text-sm shadow-md text-gray-900"
          >
            Start Lock Session
          </button>
          <button
            onClick={() => router.push("/feed")}
            className="bg-white bg-opacity-80 hover:bg-opacity-90 transition-colors px-4 py-2 rounded-full text-sm shadow-md text-gray-900"
          >
            View Feed
          </button>
        </div>
      </footer>
    </div>
  );
}
