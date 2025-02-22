"use client";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-8 drop-shadow-2xl animate-pulse">
        Check Your Email
      </h1>
      <p className="mb-8 text-lg md:text-xl max-w-md text-center text-gray-300 tracking-wide">
        We&apos;ve sent you an email with a confirmation link. Please check your inbox (and spam folder) and click the link to complete your registration.
      </p>
      <p className="mb-12 text-lg md:text-xl text-center text-gray-300 tracking-wide">
        Once confirmed, you can log in and start using the app.
      </p>
      <div className="mt-8">
        <button className="bg-blue-600 hover:bg-blue-700 transition-all px-8 py-4 rounded-full text-2xl shadow-xl transform hover:scale-105 active:animate-ping">
          Back to Login
        </button>
      </div>
    </div>
  );
}
