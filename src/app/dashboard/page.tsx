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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-semibold mb-4 text-black">
          Welcome, {session?.user.user_metadata.display_name || session?.user.email}
        </h2>

        {/* ✅ Show Total Focus Time */}
        <div className="text-xl font-semibold text-black mb-6">
  Total Focus Time: 
  <span className="text-green-600"> {Math.floor(totalFocusTime / 3600)}:
    {String(Math.floor((totalFocusTime % 3600) / 60)).padStart(2, "0")}:
    {String(totalFocusTime % 60).padStart(2, "0")}
  </span>
</div>
{/* ✅ Leaderboard page button */}
        <button onClick={() => router.push("/leaderboard")}
    className="bg-green-500 text-white px-4 py-2 rounded-lg mt-6">
    View Leaderboard
</button>

        {/* ✅ Lock session button */}
        <button onClick={() => router.push("/session")}
    className="bg-green-500 text-white px-4 py-2 rounded-lg mt-6">
    Start Lock Session
</button>
<button onClick={() => router.push("/feed")}
    className="bg-green-500 text-white px-4 py-2 rounded-lg mt-6">
    View Feed
</button>
      </main>
    </div>
  );
}
