import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Ensure this is treated as a dynamic API route
export const dynamic = 'force-dynamic'

// GET - Get check-in statistics for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    // Guard against build-time execution
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Get total registrations and checked-in count
    const [totalRegistrations, checkedInCount, recentCheckIns] = await Promise.all([
      prisma.registration.count({
        where: { 
          eventId,
          status: 'CONFIRMED'
        }
      }),
      prisma.registration.count({
        where: { 
          eventId,
          status: 'CONFIRMED',
          checkedIn: true 
        }
      }),
      prisma.registration.findMany({
        where: {
          eventId,
          checkedIn: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              company: true
            }
          }
        },
        orderBy: {
          checkedInAt: 'desc'
        },
        take: 10
      })
    ])

    return NextResponse.json({
      totalRegistrations,
      checkedInCount,
      notCheckedInCount: totalRegistrations - checkedInCount,
      checkInRate: totalRegistrations > 0 
        ? Math.round((checkedInCount / totalRegistrations) * 100) 
        : 0,
      recentCheckIns: recentCheckIns.map(r => ({
        id: r.id,
        user: r.user,
        checkedInAt: r.checkedInAt
      }))
    })
  } catch (error) {
    console.error('Failed to get check-in stats:', error)
    return NextResponse.json(
      { error: 'Failed to get check-in statistics' },
      { status: 500 }
    )
  }
}

// POST - Check in an attendee via QR code
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    // Guard against build-time execution
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { qrCode } = body

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      )
    }

    // Find registration by QR code
    const registration = await prisma.registration.findFirst({
      where: {
        qrCode,
        eventId
      },
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
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Invalid QR code or registration not found' },
        { status: 404 }
      )
    }

    if (registration.status !== 'CONFIRMED') {
      return NextResponse.json(
        { 
          error: `Registration is ${registration.status.toLowerCase()}`,
          registration: {
            id: registration.id,
            status: registration.status,
            user: registration.user
          }
        },
        { status: 400 }
      )
    }

    if (registration.checkedIn) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: 'Attendee was already checked in',
        registration: {
          id: registration.id,
          user: registration.user,
          ticketType: registration.ticketType?.name,
          checkedInAt: registration.checkedInAt
        }
      })
    }

    // Check in the attendee
    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date()
      },
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
      }
    })

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      message: 'Check-in successful!',
      registration: {
        id: updatedRegistration.id,
        user: updatedRegistration.user,
        ticketType: updatedRegistration.ticketType?.name,
        checkedInAt: updatedRegistration.checkedInAt
      }
    })
  } catch (error) {
    console.error('Failed to check in:', error)
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
}
