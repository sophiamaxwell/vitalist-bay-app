import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/events/[eventId]/rooms - List all rooms for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    const rooms = await prisma.room.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST /api/events/[eventId]/rooms - Create a new room
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const body = await request.json()
    const { name, capacity, floor, sortOrder } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get max sortOrder if not provided
    let order = sortOrder
    if (order === undefined) {
      const maxRoom = await prisma.room.findFirst({
        where: { eventId },
        orderBy: { sortOrder: 'desc' },
      })
      order = (maxRoom?.sortOrder || 0) + 1
    }

    const room = await prisma.room.create({
      data: {
        eventId,
        name,
        capacity: capacity || null,
        floor: floor || null,
        sortOrder: order,
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
