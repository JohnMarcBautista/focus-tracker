"use client";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">
        Check Your Email
      </h1>
      <p className="mb-6 text-black">
        We've sent you an email with a confirmation link. Please check your inbox (and spam folder) and click the link to complete your registration.
      </p>
      <p className="text-black">
        Once confirmed, you can log in and start using the app.
      </p>
    </div>
  );
}
