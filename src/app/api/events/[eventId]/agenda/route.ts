import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/[eventId]/agenda - Get user's personal agenda
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const agendaItems = await prisma.personalAgendaItem.findMany({
      where: {
        eventId,
        userId,
      },
      include: {
        session: {
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
        },
      },
      orderBy: {
        session: {
          startTime: 'asc',
        },
      },
    })

    return NextResponse.json(agendaItems)
  } catch (error) {
    console.error('Error fetching agenda:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agenda' },
      { status: 500 }
    )
  }
}

// POST /api/events/[eventId]/agenda - Add session to personal agenda
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const body = await request.json()
    const { userId, sessionId } = body

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'User ID and Session ID are required' },
        { status: 400 }
      )
    }

    // Verify session exists and belongs to this event
    const session = await prisma.eventSession.findFirst({
      where: {
        id: sessionId,
        eventId,
        isPublished: true,
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not published' },
        { status: 404 }
      )
    }

    // Check if already in agenda
    const existing = await prisma.personalAgendaItem.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Session already in agenda' },
        { status: 409 }
      )
    }

    // Add to agenda
    const agendaItem = await prisma.personalAgendaItem.create({
      data: {
        userId,
        sessionId,
        eventId,
      },
      include: {
        session: {
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
        },
      },
    })

    return NextResponse.json(agendaItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to agenda:', error)
    return NextResponse.json(
      { error: 'Failed to add to agenda' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[eventId]/agenda - Remove session from personal agenda
export async function DELETE(
  request: NextRequest,
  _context: { params: { eventId: string } }
) {
  void _context; // eventId available via context.params.eventId if needed
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'User ID and Session ID are required' },
        { status: 400 }
      )
    }

    // Delete from agenda
    await prisma.personalAgendaItem.delete({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from agenda:', error)
    return NextResponse.json(
      { error: 'Failed to remove from agenda' },
      { status: 500 }
    )
  }
}
