import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/events/[eventId]/sessions - List all sessions for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const { searchParams } = new URL(request.url)
    
    // Query params for filtering
    const trackId = searchParams.get('trackId')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const published = searchParams.get('published')
    const date = searchParams.get('date')

    const where: Record<string, unknown> = {
      eventId,
    }

    // Apply filters
    if (trackId) {
      where.trackId = trackId
    }
    if (type) {
      where.type = type
    }
    if (published !== null && published !== undefined) {
      where.isPublished = published === 'true'
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      where.startTime = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    const sessions = await prisma.eventSession.findMany({
      where,
      include: {
        track: true,
        room: true,
        speakers: {
          include: {
            speaker: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST /api/events/[eventId]/sessions - Create a new session
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const body = await request.json()

    const {
      title,
      description,
      startTime,
      endTime,
      type,
      trackId,
      roomId,
      speakerIds,
      capacity,
      streamUrl,
      recordingUrl,
      isPublished,
    } = body

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Title, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Create session with speakers
    const session = await prisma.eventSession.create({
      data: {
        eventId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type: type || 'TALK',
        trackId: trackId || null,
        roomId: roomId || null,
        capacity: capacity || null,
        streamUrl: streamUrl || null,
        recordingUrl: recordingUrl || null,
        isPublished: isPublished ?? true,
        speakers: speakerIds && speakerIds.length > 0
          ? {
              create: speakerIds.map((speakerId: string, index: number) => ({
                speakerId,
                sortOrder: index,
                role: 'Speaker',
              })),
            }
          : undefined,
      },
      include: {
        track: true,
        room: true,
        speakers: {
          include: {
            speaker: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
