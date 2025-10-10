import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import AddWebsiteForm from "./AddWebsiteForm";
import WebsiteCardGrid from "./WebsiteCardGrid";
import SignOutButton from "./SignOutButton";
import DeleteAccountButton from "./DeleteAccountButton";

import { Status } from "@prisma/client";

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

async function getWebsites(userId: string): Promise<{ websites: Website[]; error: string | null }> {
  try {
    const websites = await prisma.website.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        uptimeLogs: {
          take: 10,
          orderBy: { timestamp: "desc" },
        },
      },
    });
    return { websites, error: null };
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return { websites: [], error: "Unable to load websites. Please try again." };
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }
  
  const { websites, error } = await getWebsites(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Logged in as: {session.user.email}
              </span>
              <SignOutButton />
              <DeleteAccountButton />
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {error && (
            <div className="p-3 bg-gray-700/80 text-red-300 rounded-lg border border-red-900/50 text-center">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-gray-700/30 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Add New Website</h2>
            <AddWebsiteForm userId={session.user.id} />
          </div>

          <div className="rounded-xl border border-gray-700/30 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Websites</h2>
            <WebsiteCardGrid initialWebsites={websites} userId={session.user.id} />
          </div>
        </main>
      </div>
    </div>
  );
}

// Enable Incremental Static Regeneration (ISR)
export const revalidate = 60; // Revalidate every 60 seconds