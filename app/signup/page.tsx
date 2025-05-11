"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import axios from "axios";

interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

const validateForm = ({ name, email, password }: SignUpForm) => {
  if (!name.trim()) return "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Memoized submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isLoading) return; // Prevent double submission

      setIsLoading(true);
      setError(null);

      // Collect form values from refs
      const formValues: SignUpForm = {
        name: nameRef.current?.value || "",
        email: emailRef.current?.value || "",
        password: passwordRef.current?.value || "",
      };

      // Client-side validation
      const validationError = validateForm(formValues);
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post("/api/signup", formValues);

        if (response.status === 201) {
          router.push("/signin");
        } else {
          const data = response.data as { error?: string };
          setError(data.error || "Failed to sign up");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Create Account</h1>
          <p className="text-gray-400">Join us to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-gray-700/80 text-red-300 rounded-lg border border-red-900/50 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              ref={nameRef}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400 transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              ref={emailRef}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400 transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              ref={passwordRef}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-gray-500/20 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400">
          <p>
            Already have an account?{' '}
            <Link
              href="/signin"
              className="text-gray-300 hover:text-white font-medium underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}