"use client";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white bg-[url('/stars-bg.jpg')] bg-cover bg-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
        Check Your Email
      </h1>
      <p className="mb-8 text-lg md:text-xl max-w-md text-center text-gray-300">
        We&apos;ve sent you an email with a confirmation link. Please check your inbox (and spam folder) and click the link to complete your registration.
      </p>
      <p className="text-lg md:text-xl text-center text-gray-300">
        Once confirmed, you can log in and start using the app.
      </p>
    </div>
  );
}

