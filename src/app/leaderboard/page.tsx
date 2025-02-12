"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type LeaderboardEntry = {
    user_id: string;
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-6 text-black">Leaderboard</h1>

            <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left py-2 text-black">Rank</th>
                            <th className="text-left py-2 text-black">User</th>
                            <th className="text-left py-2 text-black">Total Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((user, index) => (
                            <tr key={user.user_id} className="border-t">
                                <td className="py-2 text-black">{index + 1}</td>
                                <td className="py-2 text-black">{user.user_id.substring(0, 6)}...</td>
                                <td className="py-2 text-black">
                                    {Math.floor(user.total_time / 3600)}h{" "}
                                    {Math.floor((user.total_time % 3600) / 60)}m{" "}
                                    {user.total_time % 60}s
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Back to Dashboard Button */}
            <button
                onClick={() => router.push("/dashboard")}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
                Back to Dashboard
            </button>
        </div>
    );
}
