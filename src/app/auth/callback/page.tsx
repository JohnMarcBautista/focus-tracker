"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();

      console.log("Auth Callback - Session Data:", data);
      if (error || !data.session) {
        console.error("Auth Error:", error);
        router.replace("/auth"); // Redirect back to login if session fails
      } else {
        router.replace("/dashboard"); // ✅ Redirect to dashboard if logged in
      }
    };

    handleAuthRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Logging in...</h1>
    </div>
  );
}
