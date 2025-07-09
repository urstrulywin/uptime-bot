import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-md w-full mx-auto p-8 rounded-xl shadow-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Uptime Monitor</h1>
        <p className="text-gray-400 mb-6">Monitor your website's availability</p>

        <div className="flex justify-center space-x-4">
          <Link
            href="/signin"
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-600"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}