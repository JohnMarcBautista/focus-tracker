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
        data: { display_name: displayName }  // Store the display name in user metadata
      }
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/auth"); // Redirect after successful registration
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username / Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="p-2 border border-gray-300 rounded text-black"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border border-gray-300 rounded text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border border-gray-300 rounded text-black"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
      <p className="mt-4">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-500 underline">
          Log in
        </a>
      </p>
    </div>
  );
}
