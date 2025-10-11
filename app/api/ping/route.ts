import { NextResponse } from "next/server";
import { pingWebsites } from "@/lib/ping";

export async function GET() {
  try {
    await pingWebsites();
    return NextResponse.json(
      { success: true, message: "Website ping job completed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ping job failed:", error);
    return NextResponse.json(
      { success: false, message: "Website ping job failed.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Vercel configuration
export const dynamic = "force-dynamic"; // Ensure no caching
export const maxDuration = 60; // Allow 60s for large website lists