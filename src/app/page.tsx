import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
        Time to Lock In
      </h1>
      <p className="mb-8 text-xl text-center">Click below to log in:</p>
      <Link href="/auth/login">
        <button className="bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 rounded-full text-xl shadow-xl">
          Go to Login
        </button>
      </Link>
    </div>
  );
}
