import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/[eventId]/speakers - List all speakers for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')

    const where: { eventId: string; featured?: boolean } = { eventId }
    if (featured === 'true') {
      where.featured = true
    }

    const speakers = await prisma.speaker.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(speakers)
  } catch (error) {
    console.error('Error fetching speakers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch speakers' },
      { status: 500 }
    )
  }
}

// POST /api/events/[eventId]/speakers - Create a new speaker
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
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

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get max sortOrder if not provided
    let order = sortOrder
    if (order === undefined) {
      const maxSpeaker = await prisma.speaker.findFirst({
        where: { eventId },
        orderBy: { sortOrder: 'desc' },
      })
      order = (maxSpeaker?.sortOrder || 0) + 1
    }

    const speaker = await prisma.speaker.create({
      data: {
        eventId,
        name,
        email: email || null,
        avatar: avatar || null,
        bio: bio || null,
        company: company || null,
        jobTitle: jobTitle || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        website: website || null,
        featured: featured || false,
        sortOrder: order,
      },
    })

    return NextResponse.json(speaker, { status: 201 })
  } catch (error) {
    console.error('Error creating speaker:', error)
    return NextResponse.json(
      { error: 'Failed to create speaker' },
      { status: 500 }
    )
  }
}
