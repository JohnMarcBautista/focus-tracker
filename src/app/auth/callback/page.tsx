"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Auth Error:", error);
        router.replace("/auth/login"); // ✅ Redirect to `/auth/login` instead of `/auth`
      } else {
        router.replace("/dashboard"); // ✅ Send logged-in users to dashboard
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
