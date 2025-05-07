"use client";

import React from "react";
import { signOut } from "next-auth/react";
import axios from "axios";

export default function DeleteAccountButton() {
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      try {
        const response = await axios.delete("/api/user");
        if (response.status !== 200) throw new Error("Failed to delete account");
        await signOut({ callbackUrl: "/signin" });
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
    }

  };

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-gray-200 transition-colors shadow-md"
    >
      Delete Account
    </button>
  );
}