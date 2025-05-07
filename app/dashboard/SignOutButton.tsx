"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await signOut({ callbackUrl: "/signin" });
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors shadow-md"
    >
      Sign Out
    </button>
  );
}