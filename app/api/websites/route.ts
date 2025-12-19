import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { Status } from "@prisma/client";
import axios from "axios";

const MAX_WEBSITES_PER_USER = 20;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;

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

    return NextResponse.json(websites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Must include http:// or https://" },
        { status: 400 }
      );
    }

    const websiteCount = await prisma.website.count({
      where: { userId },
    });

    if (websiteCount >= MAX_WEBSITES_PER_USER) {
      return NextResponse.json(
        { error: `You've reached the maximum number of websites (${MAX_WEBSITES_PER_USER})` },
        { status: 400 }
      );
    }

    const existingWebsite = await prisma.website.findFirst({
      where: {
        userId,
        url: parsedUrl.toString(),
      },
    });

    if (existingWebsite) {
      return NextResponse.json(
        { error: "You are already monitoring this website" },
        { status: 400 }
      );
    }

    let responseStatus: Status = Status.down;

    try {
      const response = await axios.get(parsedUrl.toString(), {
        timeout: 10000,
        validateStatus: () => true,
      });
      responseStatus = response.status < 400 ? Status.up : Status.down;
    } catch (error) {
      console.log("Initial check failed:", error); // Log error message
      responseStatus = Status.down;
    }

    const website = await prisma.website.create({
      data: {
        url: parsedUrl.toString(),
        status: responseStatus,
        userId,
        lastChecked: new Date(),
        uptimeLogs: {
          create: {
            status: responseStatus,
          },
        },
      },
      include: {
        uptimeLogs: true,
      },
    });

    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    console.error("Error adding website:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deleteId = searchParams.get("deleteId");

    if (!deleteId) {
      return NextResponse.json({ error: "Website ID is required" }, { status: 400 });
    }

    await prisma.website.delete({
      where: {
        id: deleteId,
        userId: session.user.id, // Ensures the user can only delete their own websites
      },
    });

    return NextResponse.json({ message: "Website deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting website:", error);
    return NextResponse.json({ error: "Failed to delete website" }, { status: 500 });
  }
}