"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 drop-shadow-lg">
        Login to Focus Tracker
      </h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 rounded-lg border border-gray-700 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 rounded-lg border border-gray-700 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 rounded-full text-xl shadow-xl">
          Login
        </button>
      </form>
      <p className="mt-6 text-center">
        Don&apos;t have an account?{" "}
        <a href="/auth/register" className="text-blue-500 underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}
