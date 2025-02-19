import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to Focus Tracker</h1>
      <p className="mb-4">Click below to log in:</p>
      <Link href="/auth/login"> {/* ✅ Fixes broken redirect */}
        <button className="bg-blue-500 text-white p-2 rounded">Go to Login</button>
      </Link>
    </div>
  );
}
