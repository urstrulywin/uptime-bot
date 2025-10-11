"use client";

import { useState, useEffect } from "react";
import WebsiteCard from "./WebsiteCard";
import { Status } from "@prisma/client";
import axios from "axios";

interface UptimeLog {
  id: string;
  status: Status;
  responseTime: number | null;
  timestamp: Date;
  websiteId: string;
}

interface Website {
  id: string;
  url: string;
  status: Status;
  lastChecked: Date | null;
  uptimeLogs: UptimeLog[];
  userId: string;
}

interface WebsiteCardGridProps {
  initialWebsites: Website[];
  userId: string;
}

const WebsiteCardGrid = ({ initialWebsites, userId }: WebsiteCardGridProps) => {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Website[]>(`/api/websites?userId=${userId}`);
        setWebsites(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load websites");
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, [userId]);

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`/api/websites?deleteId=${id}`);
      if (response.status !== 200) throw new Error("Failed to delete website");
      setWebsites(websites.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-700/30 bg-gray-800/50 p-6 h-[180px] animate-pulse"
          >
            <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 mt-4 bg-gray-700 rounded"></div>
            <div className="h-20 w-full mt-4 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-700/30 bg-red-900/10 p-6 text-center text-red-300">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700/30 bg-gray-800/50 p-10 text-center">
        <p className="text-gray-400">No websites added yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Add your first website to start monitoring
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {websites.map((website) => (
        <WebsiteCard
          key={website.id}
          website={website}
          onDelete={() => handleDelete(website.id)}
        />
      ))}
    </div>
  );
};

export default WebsiteCardGrid;