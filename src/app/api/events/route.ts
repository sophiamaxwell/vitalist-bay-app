import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      // Event type (for analytics/categorization)
      eventType,
      // Event details
      name,
      description,
      startDate,
      endDate,
      timezone,
      format,
      sector,
      venue,
      address,
      city,
      country,
      virtualUrl,
      // Community
      communityName,
      slug: rawSlug,
      primaryColor,
      logo,
      // Organization (stored as metadata for now)
      organizationName,
      organizationType,
      organizationCountry,
      eventsPerYear,
      expectedAttendees,
      // Key results
      objectives,
      customObjective,
    } = body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Missing required fields: name, startDate, endDate" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = rawSlug || slugify(name);

    // Check if slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
    });

    if (existingEvent) {
      return NextResponse.json(
        { message: "An event with this URL already exists. Please choose a different name." },
        { status: 409 }
      );
    }

    // Map format to EventFormat enum
    const eventFormat = format === "IN_PERSON" 
      ? "IN_PERSON" 
      : format === "VIRTUAL" 
      ? "VIRTUAL" 
      : "HYBRID";

    // Create the event
    const event = await prisma.event.create({
      data: {
        name,
        slug,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        timezone: timezone || "America/Los_Angeles",
        format: eventFormat,
        venue: venue || null,
        address: address || null,
        city: city || null,
        country: country || null,
        virtualUrl: virtualUrl || null,
        primaryColor: primaryColor || "#00B894",
        logo: logo || null,
        // These would typically be stored in a separate Organization model
        // For now, we could store them as JSON metadata if the schema supported it
        isPublished: false,
        registrationOpen: true,
        networkingEnabled: true,
        messagingEnabled: true,
        meetingRequestEnabled: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 }
    );
  }
}

// Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // "published" | "draft"

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.isPublished = true;
    } else if (status === "draft") {
      where.isPublished = false;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              registrations: true,
              eventSessions: true,
              speakers: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
