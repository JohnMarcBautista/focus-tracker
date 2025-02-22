"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 drop-shadow-2xl">
        Register to Alter your Future
      </h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-6 w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 rounded-lg border border-gray-700 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <input
          type="text"
          placeholder="Username / Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
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
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-4 rounded-full text-xl shadow-xl"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-6 text-center text-lg">
        Already have an account?{" "}
        <a
          href="/auth/login"
          className="text-blue-500 underline hover:text-blue-400 transition-colors"
        >
          Log in
        </a>
      </p>
    </div>
  );
}
