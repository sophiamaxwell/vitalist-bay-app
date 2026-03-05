import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/events/[eventId]/speakers/[speakerId] - Get a single speaker with sessions
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string; speakerId: string } }
) {
  try {
    const { eventId, speakerId } = params

    const speaker = await prisma.speaker.findFirst({
      where: {
        id: speakerId,
        eventId,
      },
      include: {
        sessions: {
          include: {
            session: {
              include: {
                room: {
                  select: { name: true },
                },
                track: {
                  select: { name: true, color: true },
                },
              },
            },
          },
          orderBy: {
            session: {
              startTime: 'asc',
            },
          },
        },
      },
    })

    if (!speaker) {
      return NextResponse.json(
        { error: 'Speaker not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(speaker)
  } catch (error) {
    console.error('Error fetching speaker:', error)
    return NextResponse.json(
      { error: 'Failed to fetch speaker' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[eventId]/speakers/[speakerId] - Update a speaker
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; speakerId: string } }
) {
  try {
    const { eventId, speakerId } = params
    const body = await request.json()

    const {
      name,
      email,
      avatar,
      bio,
      company,
      jobTitle,
      linkedin,
      twitter,
      website,
      featured,
      sortOrder,
    } = body

    // Check speaker exists
    const existingSpeaker = await prisma.speaker.findFirst({
      where: {
        id: speakerId,
        eventId,
      },
    })

    if (!existingSpeaker) {
      return NextResponse.json(
        { error: 'Speaker not found' },
        { status: 404 }
      )
    }

    // Check for email conflicts
    if (email && email !== existingSpeaker.email) {
      const emailExists = await prisma.speaker.findFirst({
        where: {
          eventId,
          email,
          id: { not: speakerId },
        },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'A speaker with this email already exists for this event' },
          { status: 400 }
        )
      }
    }

    const speaker = await prisma.speaker.update({
      where: { id: speakerId },
      data: {
        name: name ?? existingSpeaker.name,
        email: email !== undefined ? (email || null) : existingSpeaker.email,
        avatar: avatar !== undefined ? (avatar || null) : existingSpeaker.avatar,
        bio: bio !== undefined ? (bio || null) : existingSpeaker.bio,
        company: company !== undefined ? (company || null) : existingSpeaker.company,
        jobTitle: jobTitle !== undefined ? (jobTitle || null) : existingSpeaker.jobTitle,
        linkedin: linkedin !== undefined ? (linkedin || null) : existingSpeaker.linkedin,
        twitter: twitter !== undefined ? (twitter || null) : existingSpeaker.twitter,
        website: website !== undefined ? (website || null) : existingSpeaker.website,
        featured: featured ?? existingSpeaker.featured,
        sortOrder: sortOrder ?? existingSpeaker.sortOrder,
      },
      include: {
        sessions: {
          include: {
            session: {
              include: {
                room: { select: { name: true } },
                track: { select: { name: true, color: true } },
              },
            },
          },
          orderBy: {
            session: { startTime: 'asc' },
          },
        },
      },
    })

    return NextResponse.json(speaker)
  } catch (error) {
    console.error('Error updating speaker:', error)
    return NextResponse.json(
      { error: 'Failed to update speaker' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[eventId]/speakers/[speakerId] - Delete a speaker
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; speakerId: string } }
) {
  try {
    const { eventId, speakerId } = params

    // Check speaker exists
    const existingSpeaker = await prisma.speaker.findFirst({
      where: {
        id: speakerId,
        eventId,
      },
    })

    if (!existingSpeaker) {
      return NextResponse.json(
        { error: 'Speaker not found' },
        { status: 404 }
      )
    }

    // Delete speaker (cascade will handle SessionSpeaker relations)
    await prisma.speaker.delete({
      where: { id: speakerId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting speaker:', error)
    return NextResponse.json(
      { error: 'Failed to delete speaker' },
      { status: 500 }
    )
  }
}
