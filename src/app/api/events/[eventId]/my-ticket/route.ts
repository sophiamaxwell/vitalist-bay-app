import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth-utils'

// GET - Get current user's ticket/registration for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    
    // Get authenticated user
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        venue: true,
        address: true,
        city: true
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get user's registration
    const registration = await prisma.registration.findFirst({
      where: {
        eventId,
        userId: session.user.id
      },
      include: {
        ticketType: {
          select: {
            name: true
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Not registered for this event' },
        { status: 404 }
      )
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({
      registration: {
        id: registration.id,
        qrCode: registration.qrCode,
        checkedIn: registration.checkedIn,
        checkedInAt: registration.checkedInAt,
        status: registration.status,
        ticketType: registration.ticketType
      },
      event,
      user
    })
  } catch (error) {
    console.error('Failed to get ticket:', error)
    return NextResponse.json(
      { error: 'Failed to get ticket' },
      { status: 500 }
    )
  }
}
