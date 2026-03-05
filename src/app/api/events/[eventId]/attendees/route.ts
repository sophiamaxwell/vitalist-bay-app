import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List attendees with check-in status
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // all, checked-in, not-checked-in
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: { eventId: string; status: string; checkedIn?: boolean; user?: { OR: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }> } } = {
      eventId,
      status: 'CONFIRMED'
    }

    if (filter === 'checked-in') {
      where.checkedIn = true
    } else if (filter === 'not-checked-in') {
      where.checkedIn = false
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Get attendees
    const [attendees, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              company: true,
              jobTitle: true
            }
          },
          ticketType: {
            select: {
              name: true
            }
          }
        },
        orderBy: [
          { checkedIn: 'desc' },
          { checkedInAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.registration.count({ where })
    ])

    return NextResponse.json({
      attendees: attendees.map(r => ({
        id: r.id,
        qrCode: r.qrCode,
        user: r.user,
        ticketType: r.ticketType?.name || 'General',
        checkedIn: r.checkedIn,
        checkedInAt: r.checkedInAt,
        registeredAt: r.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to get attendees:', error)
    return NextResponse.json(
      { error: 'Failed to get attendees' },
      { status: 500 }
    )
  }
}
