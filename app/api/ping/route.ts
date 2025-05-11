import { NextResponse } from "next/server";
import { pingWebsites } from "@/lib/ping";

export async function GET() {
  try {
    await pingWebsites();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ping job failed:", error);
    return NextResponse.json({ error: "Ping job failed" }, { status: 500 });
  }
}