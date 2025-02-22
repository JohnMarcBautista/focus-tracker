"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type LeaderboardEntry = {
  display_name: string;
  total_time: number;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) {
        console.error("🔴 Error fetching leaderboard:", error.message);
        return;
      }
      setLeaderboard(data);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 drop-shadow-lg">
        Leaderboard
      </h1>

      <div className="w-full max-w-2xl bg-gray-800 bg-opacity-90 p-6 rounded-2xl shadow-2xl">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 border-b border-gray-700">Rank</th>
              <th className="text-left py-3 border-b border-gray-700">User</th>
              <th className="text-left py-3 border-b border-gray-700">Total Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user.display_name} className="border-b border-gray-700">
                <td className="py-3">{index + 1}</td>
                <td className="py-3">
                  {user.display_name.length > 12
                    ? user.display_name.substring(0, 12) + "..."
                    : user.display_name}
                </td>
                <td className="py-3">
                  {Math.floor(user.total_time / 3600)}h{" "}
                  {Math.floor((user.total_time % 3600) / 60)}m{" "}
                  {user.total_time % 60}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-10 bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 rounded-full text-xl shadow-xl"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
