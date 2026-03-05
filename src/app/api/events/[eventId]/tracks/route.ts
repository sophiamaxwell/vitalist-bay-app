import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/events/[eventId]/tracks - List all tracks for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    const tracks = await prisma.track.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
}

// POST /api/events/[eventId]/tracks - Create a new track
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const body = await request.json()
    const { name, color, sortOrder } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get max sortOrder if not provided
    let order = sortOrder
    if (order === undefined) {
      const maxTrack = await prisma.track.findFirst({
        where: { eventId },
        orderBy: { sortOrder: 'desc' },
      })
      order = (maxTrack?.sortOrder || 0) + 1
    }

    const track = await prisma.track.create({
      data: {
        eventId,
        name,
        color: color || '#6366f1',
        sortOrder: order,
      },
    })

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    console.error('Error creating track:', error)
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    )
  }
}
