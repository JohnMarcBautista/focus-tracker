import Link from "next/link";
import Carousel from "@/components/Carousel";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black bg-[url('/stars-bg.jpg')] bg-cover bg-center flex flex-col items-center justify-center p-8 text-white">
      {/* Black overlay for bottom 1/3 of the page */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-black pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-2xl">
          Locked In
        </h1>
        <div className="w-full max-w-4xl mb-12">
          <Carousel />
        </div>
        <Link href="/auth/register">
          <button className="bg-blue-600 hover:bg-blue-700 transition-all px-16 py-2 rounded-full text-2xl shadow-xl transform hover:scale-105 active:animate-ping">
            Sign Up
          </button>
        </Link>
        <p className="mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
