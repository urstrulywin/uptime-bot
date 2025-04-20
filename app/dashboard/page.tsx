import WebsitesTable from "./WebsitesTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import AddWebsiteForm from "./AddWebsiteForm";
import { redirect } from "next/navigation";
import { pingWebsites } from "@/lib/ping";

let hasRun = false;

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Controlled async execution
  if (!hasRun) {
    await new Promise<void>(async (resolve) => {
      try {
        await pingWebsites();
        hasRun = true;
        console.log("Ping job executed successfully in dashboard.");
        resolve();
      } catch (error) {
        console.error("Ping job failed in dashboard:", error);
        resolve();
      }
    });
  }

  const websites = await prisma.website.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      uptimeLogs: {
        take: 10,
        orderBy: { timestamp: "desc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Sign Out Button */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Logged in as: {session.user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors shadow-md"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Add Website Card */}
          <div className="rounded-xl border border-gray-700/30 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Add New Website</h2>
            <AddWebsiteForm userId={session.user.id} />
          </div>

          {/* Websites Table Card */}
          <div className="rounded-xl border border-gray-700/30 bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <WebsitesTable initialWebsites={websites} userId={session.user.id} />
          </div>
        </main>
      </div>
    </div>
  );
}