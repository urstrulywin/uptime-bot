import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // Your existing Prisma client
import axios from "axios";
import { Status } from "@prisma/client";

// Function to ping all websites
const pingWebsites = async () => {
  try {
    console.log("Starting ping job at:", new Date().toISOString());

    const websites = await prisma.website.findMany();

    for (const website of websites) {
      let responseStatus: Status =Status.down ;
      let responseTime: number | null = null;

      try {
        const start = Date.now();
        const response = await axios.get(website.url, {
          timeout: 10000, // 10-second timeout
          validateStatus: () => true, // Accept all status codes
        });
        responseTime = Date.now() - start;
        responseStatus = response.status < 400 ? "up" : "down";
      } catch (error) {
        console.error(`Ping failed for ${website.url}:`, (error as any).message);
      }

      await prisma.website.update({
        where: { id: website.id },
        data: {
          status: responseStatus,
          lastChecked: new Date(),
          updatedAt: new Date(),
        },
      });

      await prisma.uptimeLog.create({
        data: {
          status: responseStatus,
          responseTime,
          websiteId: website.id,
          timestamp: new Date(),
        },
      });
    }

    console.log("Ping job completed for all websites.");
    return NextResponse.json({ message: "Ping job completed successfully" });
  } catch (error) {
    console.error("Error during ping process:", error);
    return NextResponse.json({ error: "Ping job failed" }, { status: 500 });
  }
};

export async function GET() {
  return pingWebsites();
}