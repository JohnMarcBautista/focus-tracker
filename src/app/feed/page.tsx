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
  const [likeCounts, setLikeCounts] = useState<{ [postId: string]: number }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pageSize = 10;

  // Fetch the current user on mount.
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    getUser();
  }, []);

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
      const newSessions = data as unknown as SessionData[];
      setSessions((prev) => [...prev, ...newSessions]);
      // For each new session, fetch its like count.
      newSessions.forEach((session) => {
        fetchLikeCount(session.id);
      });
    }
    setLoading(false);
  }, [page, pageSize]);

  const fetchLikeCount = async (postId: string) => {
    const { count, error } = await supabase
      .from("post_likes")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);
    if (error) {
      console.error("Error fetching like count:", error.message);
    } else {
      setLikeCounts((prev) => ({ ...prev, [postId]: count || 0 }));
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) {
      console.error("User not logged in!");
      return;
    }
    // Check if the current user has already liked the post.
    const { data: existingLikes, error: fetchError } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", currentUserId);

    if (fetchError) {
      console.error("Error fetching like:", fetchError.message);
      return;
    }

    if (existingLikes && existingLikes.length > 0) {
      // If already liked, remove the like.
      const likeId = existingLikes[0].id;
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("id", likeId);
      if (deleteError) {
        console.error("Error unliking post:", deleteError.message);
      } else {
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: Math.max((prev[postId] || 1) - 1, 0),
        }));
      }
    } else {
      // Otherwise, insert a new like.
      const { error } = await supabase
        .from("post_likes")
        .insert([{ post_id: postId, user_id: currentUserId }]);
      if (error) {
        console.error("Error liking post:", error.message);
      } else {
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1,
        }));
      }
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center drop-shadow-lg">
        Lock Sessions Feed
      </h1>
      <div className="space-y-8">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-gray-800 bg-opacity-90 p-6 rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            <div className="mb-4">
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
            <div className="mb-6">
              <p className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                {Math.floor(session.duration / 3600)}h{" "}
                {Math.floor((session.duration % 3600) / 60)}m{" "}
                {session.duration % 60}
              </p>
              <p className="mt-1 text-sm uppercase tracking-wider text-gray-400">
                Duration
              </p>
            </div>
            <div className="text-sm grid grid-cols-2 gap-4 text-gray-300">
              <p>Tab Active: {session.tab_active_time.toFixed(1)}s</p>
              <p>Tab Inactive: {session.tab_inactive_time.toFixed(1)}s</p>
              <p>Window Focus: {session.window_focus_time.toFixed(1)}s</p>
              <p>Window Unfocus: {session.window_unfocus_time.toFixed(1)}s</p>
              <p>Tab Switches: {session.tab_switches}</p>
              <p>Window Switches: {session.window_switches}</p>
            </div>
            {/* Like Button with Enhanced UI */}
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => handleLike(session.id)}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <svg
                  className="w-6 h-6 fill-current text-red-500 hover:text-red-400 transition transform hover:scale-110"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-sm text-gray-200">
                  {likeCounts[session.id] !== undefined
                    ? likeCounts[session.id]
                    : 0}
                </span>
              </button>
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
