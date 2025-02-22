import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-2xl">
        Welcome to Locked In
      </h1>
      <p className="text-xl md:text-2xl mb-12 text-gray-300">
        Join The World&apos;s #1 Social Focus Keeper Platform
      </p>
      <Link href="/auth/login">
        <button className="bg-blue-600 hover:bg-blue-700 transition-all px-10 py-4 rounded-full text-2xl shadow-xl transform hover:scale-105 active:animate-ping">
          Go to Login
        </button>
      </Link>
    </div>
  );
}