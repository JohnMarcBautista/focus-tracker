"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type SessionData = {
  id: string;
  user_id: string;
  duration: number;
  tab_active_time: number;
  tab_inactive_time: number;
  window_focus_time: number;
  window_unfocus_time: number;
  tab_switches: number;
  window_switches: number;
  project_name: string;
  is_public: boolean;
  created_at: string;
  user: { display_name: string } | null;
};

export default function FeedPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*, user:users_view(display_name)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
      
    if (error) {
      console.error("Error fetching sessions:", error.message);
    } else if (data) {
      setSessions((prev) => [...prev, ...(data as unknown as SessionData[])]);
    }
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center drop-shadow-lg">
        Focus Sessions Feed
      </h1>
      <div className="space-y-12">
        {sessions.map((session) => (
          <div key={session.id} className="bg-gray-800 bg-opacity-90 p-8 rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                {session.project_name || "Untitled Session"}
              </h2>
              <p className="text-sm text-gray-400">
                Posted by{" "}
                {session.user && session.user.display_name
                  ? session.user.display_name
                  : session.user_id.substring(0, 6) + "..."}{" "}
                on {new Date(session.created_at).toLocaleString()}
              </p>
            </div>
            <div className="mb-8">
              {/* Emphasized Duration */}
              <p className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                {Math.floor(session.duration / 3600)}h{" "}
                {Math.floor((session.duration % 3600) / 60)}m{" "}
                {session.duration % 60}
              </p>
              <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">Duration</p>
            </div>
            <div className="text-sm grid grid-cols-2 gap-4 text-gray-300">
              <p>Tab Active: {session.tab_active_time.toFixed(1)}s</p>
              <p>Tab Inactive: {session.tab_inactive_time.toFixed(1)}s</p>
              <p>Window Focus: {session.window_focus_time.toFixed(1)}s</p>
              <p>Window Unfocus: {session.window_unfocus_time.toFixed(1)}s</p>
              <p>Tab Switches: {session.tab_switches}</p>
              <p>Window Switches: {session.window_switches}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-4 rounded-full text-xl shadow-xl"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
