"use client";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Check Your Email
      </h1>
      <p className="mb-6 text-white text-lg max-w-md text-center">
        We&apos;ve sent you an email with a confirmation link. Please check your inbox (and spam folder) and click the link to complete your registration.
      </p>
      <p className="text-white text-lg text-center">
        Once confirmed, you can log in and start using the app.
      </p>
    </div>
  );
}

