"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function TopNav() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      setSession(null); // ✅ Clear session state immediately
      router.replace("/auth/login"); // ✅ Redirect to login page after logout
    } else {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Focus Tracker</div>
      <div className="flex space-x-4">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/session" className="hover:underline">Session</Link>
        <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>

        {session ? (
          <button 
            onClick={handleLogout} 
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition">
            Logout
          </button>
        ) : (
          <Link href="/auth/login" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
