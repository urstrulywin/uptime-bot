"use client";
import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/signin" });
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsLoading(false);
      setShowConfirm(false);
    }
  }, []);

  return (
    <div className="relative">
      {showConfirm ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-300">Are you sure?</p>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? "Signing Out..." : "Yes"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Sign Out
        </button>
      )}
    </div>
  );
}