"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type LeaderboardEntry = {
  display_name: string;
  total_time?: number;
  streak?: number;
};

export default function Leaderboard() {
  const [focusLeaderboard, setFocusLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streakLeaderboard, setStreakLeaderboard] = useState<LeaderboardEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboards = async () => {
      // Fetch total focus time leaderboard
      const { data: focusData, error: focusError } = await supabase.rpc("get_leaderboard");
      if (focusError) {
        console.error("🔴 Error fetching focus leaderboard:", focusError.message);
        return;
      }
      if (focusData) {
        setFocusLeaderboard(focusData as LeaderboardEntry[]);
      }

      // Fetch streak leaderboard
      const { data: streakData, error: streakError } = await supabase.rpc("get_streak_leaderboard");
      if (streakError) {
        console.error("🔴 Error fetching streak leaderboard:", streakError.message);
        return;
      }
      if (streakData) {
        setStreakLeaderboard(streakData as LeaderboardEntry[]);
      }
    };

    fetchLeaderboards();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 drop-shadow-lg">
        Leaderboard
      </h1>

      {/* Total Focus Time Leaderboard */}
      <div className="w-full max-w-2xl bg-gray-800 bg-opacity-90 p-6 rounded-2xl shadow-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4">Total Focus Time</h2>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-3 border-b border-gray-700">Rank</th>
                <th className="text-left py-3 border-b border-gray-700">User</th>
                <th className="text-left py-3 border-b border-gray-700">Total Time</th>
              </tr>
            </thead>
            <tbody>
              {focusLeaderboard.map((user, index) => (
                <tr key={`${user.display_name}-${index}`} className="border-b border-gray-700">
                  <td className="py-3">{index + 1}</td>
                  <td className="py-3">
                    {user.display_name.length > 12
                      ? user.display_name.substring(0, 12) + "..."
                      : user.display_name}
                  </td>
                  <td className="py-3">
                    {Math.floor((user.total_time || 0) / 3600)}h{" "}
                    {Math.floor(((user.total_time || 0) % 3600) / 60)}m{" "}
                    {(user.total_time || 0) % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streak Leaderboard */}
      <div className="w-full max-w-2xl bg-gray-800 bg-opacity-90 p-6 rounded-2xl shadow-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4">Streaks</h2>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-3 border-b border-gray-700">Rank</th>
                <th className="text-left py-3 border-b border-gray-700">User</th>
                <th className="text-left py-3 border-b border-gray-700">Streak</th>
              </tr>
            </thead>
            <tbody>
              {streakLeaderboard.map((user, index) => (
                <tr key={`${user.display_name}-${index}`} className="border-b border-gray-700">
                  <td className="py-3">{index + 1}</td>
                  <td className="py-3">
                    {user.display_name.length > 12
                      ? user.display_name.substring(0, 12) + "..."
                      : user.display_name}
                  </td>
                  <td className="py-3">
                    {user.streak && user.streak > 0 ? (
                      <span>
                        {user.streak} <span className="inline-block">🔥</span>
                      </span>
                    ) : (
                      0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
