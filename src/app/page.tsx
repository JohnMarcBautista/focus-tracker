import Link from "next/link";
import Carousel from "@/components/Carousel";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-cover bg-center p-8 text-white"
         style={{ backgroundImage: "url('/backgrounds/sunny.jpg')" }}>
      {/* Black overlay for bottom 1/3 of the page */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-black pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col w-full flex-1">
        {/* Top Section */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-2xl">
            Locked In
          </h1>
          <div className="w-full max-w-4xl mb-8">
            <Carousel />
          </div>
        </div>
        
        {/* Spacer to push the bottom section down */}
        <div className="flex-1"></div>
        
        {/* Bottom Section: Sign Up & Log In */}
        <div className="w-full flex flex-col items-center space-y-4 mb-4">
          <Link href="/auth/register">
            <button className="bg-blue-600 hover:bg-blue-700 transition-all px-16 py-2 rounded-full text-2xl shadow-xl transform hover:scale-105 active:animate-ping">
              Sign Up
            </button>
          </Link>
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
