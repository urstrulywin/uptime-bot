import prisma from "@/lib/db";
import axios from "axios";
import { Status } from "@prisma/client";

export const pingWebsites = async (): Promise<void> => {
  console.log("Starting ping job at:", new Date().toISOString());

  try {
    const websites = await prisma.website.findMany();
    if (websites.length === 0) {
      console.log("No websites to ping.");
      return;
    }

    const pingPromises = websites.map(async (website) => {
      let responseStatus: Status = Status.down;
      let responseTime: number | null = null;

      try {
        const start = Date.now();
        const response = await axios.get(website.url, {
          timeout: 2000, // 2s timeout
          validateStatus: () => true, // Accept all status codes
        });
        responseTime = Date.now() - start;
        responseStatus = response.status < 400 ? Status.up : Status.down;
      } catch (error) {
        console.error(`Ping failed for ${website.url}:`, error instanceof Error ? error.message : error);
      }

      return {
        websiteId: website.id,
        responseStatus,
        responseTime,
        timestamp: new Date(),
      };
    });

    const pingResults = await Promise.all(pingPromises);

    const transactionPromises = pingResults.map((result) =>
      prisma.$transaction([
        prisma.website.update({
          where: { id: result.websiteId },
          data: {
            status: result.responseStatus,
            lastChecked: result.timestamp,
            updatedAt: result.timestamp,
          },
        }),
        prisma.uptimeLog.create({
          data: {
            status: result.responseStatus,
            responseTime: result.responseTime,
            websiteId: result.websiteId,
            timestamp: result.timestamp,
          },
        }),
      ])
    );

    await Promise.all(transactionPromises);

    console.log(`Ping job completed for ${websites.length} websites.`);
  } catch (error) {
    console.error("Error during ping process:", error);
    throw error;
  }
};