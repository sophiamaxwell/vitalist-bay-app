import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/events/[eventId]/sessions/[sessionId] - Get a single session
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string; sessionId: string } }
) {
  try {
    const { eventId, sessionId } = params

    const session = await prisma.eventSession.findFirst({
      where: {
        id: sessionId,
        eventId,
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

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[eventId]/sessions/[sessionId] - Update a session
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; sessionId: string } }
) {
  try {
    const { eventId, sessionId } = params
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

    // Verify session exists
    const existingSession = await prisma.eventSession.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Update session
    const session = await prisma.eventSession.update({
      where: { id: sessionId },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        type: type !== undefined ? type : undefined,
        trackId: trackId !== undefined ? trackId : undefined,
        roomId: roomId !== undefined ? roomId : undefined,
        capacity: capacity !== undefined ? capacity : undefined,
        streamUrl: streamUrl !== undefined ? streamUrl : undefined,
        recordingUrl: recordingUrl !== undefined ? recordingUrl : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
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

    // Update speakers if provided
    if (speakerIds !== undefined) {
      // Delete existing speakers
      await prisma.sessionSpeaker.deleteMany({
        where: { sessionId },
      })

      // Create new speaker assignments
      if (speakerIds.length > 0) {
        await prisma.sessionSpeaker.createMany({
          data: speakerIds.map((speakerId: string, index: number) => ({
            sessionId,
            speakerId,
            sortOrder: index,
            role: 'Speaker',
          })),
        })
      }

      // Refetch session with updated speakers
      const updatedSession = await prisma.eventSession.findUnique({
        where: { id: sessionId },
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

      return NextResponse.json(updatedSession)
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[eventId]/sessions/[sessionId] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; sessionId: string } }
) {
  try {
    const { eventId, sessionId } = params

    // Verify session exists
    const existingSession = await prisma.eventSession.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Delete session (cascade will handle speakers)
    await prisma.eventSession.delete({
      where: { id: sessionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
