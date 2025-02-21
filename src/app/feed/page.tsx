"use client";

import { useState, useEffect } from "react";
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
  // Joined user data – note: using alias "user"
  user: { display_name: string } | null;
};

export default function FeedPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchSessions = async () => {
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
  };

  useEffect(() => {
    fetchSessions();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-black">Focus Sessions Feed</h1>
      <div className="space-y-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white p-6 rounded-lg shadow">
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-black">
                {session.project_name || "Untitled Session"}
              </h2>
              <p className="text-sm text-gray-600">
                Posted by{" "}
                {session.user && session.user.display_name
                  ? session.user.display_name
                  : session.user_id.substring(0, 6) + "..."}{" "}
                on {new Date(session.created_at).toLocaleString()}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-lg text-black">
                Duration: {Math.floor(session.duration / 3600)}h{" "}
                {Math.floor((session.duration % 3600) / 60)}m{" "}
                {session.duration % 60}s
              </p>
            </div>
            <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
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
      <div className="mt-6 flex justify-center">
        {loading ? (
          <p className="text-black">Loading...</p>
        ) : (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
