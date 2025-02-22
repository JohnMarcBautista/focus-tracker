"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);
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
        fetchTotalFocusTime(data.session.user.id);
      }
    };

    checkSession();
  }, [router]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
          Welcome, {session?.user.user_metadata.display_name || session?.user.email}
        </h2>

        <div className="mb-8 text-2xl md:text-3xl font-semibold">
          Total Focus Time:{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            {Math.floor(totalFocusTime / 3600)}:
            {String(Math.floor((totalFocusTime % 3600) / 60)).padStart(2, "0")}:
            {String(totalFocusTime % 60).padStart(2, "0")}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => router.push("/leaderboard")}
            className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-4 rounded-full text-xl shadow-xl"
          >
            View Leaderboard
          </button>
          <button
            onClick={() => router.push("/session")}
            className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-4 rounded-full text-xl shadow-xl"
          >
            Start Lock Session
          </button>
          <button
            onClick={() => router.push("/feed")}
            className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-4 rounded-full text-xl shadow-xl"
          >
            View Feed
          </button>
        </div>
      </main>
    </div>
  );
}
