import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendRegistrationConfirmationEmail } from '@/lib/email'

interface RouteParams {
  params: { eventId: string }
}

// POST /api/events/[eventId]/register - Register for an event
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { eventId } = params
    const body = await request.json()
    const { ticketTypeId, attendeeDetails, customFields } = body

    // Verify event exists and registration is open
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        slug: true,
        registrationOpen: true,
        startDate: true,
        endDate: true,
        venue: true,
        city: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (!event.registrationOpen) {
      return NextResponse.json(
        { error: 'Registration is closed for this event' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Validate ticket type if provided
    let ticketType = null
    if (ticketTypeId) {
      ticketType = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
      })

      if (!ticketType || ticketType.eventId !== eventId) {
        return NextResponse.json(
          { error: 'Invalid ticket type' },
          { status: 400 }
        )
      }

      // Check if ticket is available
      if (!ticketType.isActive) {
        return NextResponse.json(
          { error: 'This ticket type is no longer available' },
          { status: 400 }
        )
      }

      // Check sale dates
      const now = new Date()
      if (ticketType.saleStart && now < ticketType.saleStart) {
        return NextResponse.json(
          { error: 'Ticket sales have not started yet' },
          { status: 400 }
        )
      }
      if (ticketType.saleEnd && now > ticketType.saleEnd) {
        return NextResponse.json(
          { error: 'Ticket sales have ended' },
          { status: 400 }
        )
      }

      // Check quantity
      if (ticketType.quantity !== null && ticketType.soldCount >= ticketType.quantity) {
        return NextResponse.json(
          { error: 'This ticket type is sold out' },
          { status: 400 }
        )
      }
    }

    // Update user profile if attendee details provided
    if (attendeeDetails) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: attendeeDetails.name || undefined,
          company: attendeeDetails.company || undefined,
          jobTitle: attendeeDetails.jobTitle || undefined,
          phone: attendeeDetails.phone || undefined,
        },
      })
    }

    // Determine payment status
    const isFree = !ticketType || Number(ticketType.price) === 0
    const paymentStatus = isFree ? 'FREE' : 'PENDING'
    const registrationStatus = isFree ? 'CONFIRMED' : 'PENDING'

    // Create registration with transaction
    const registration = await prisma.$transaction(async (tx) => {
      // Increment sold count if ticket type
      if (ticketTypeId) {
        await tx.ticketType.update({
          where: { id: ticketTypeId },
          data: { soldCount: { increment: 1 } },
        })
      }

      // Create registration
      return tx.registration.create({
        data: {
          eventId,
          userId: session.user.id,
          ticketTypeId: ticketTypeId || null,
          status: registrationStatus,
          paymentStatus,
          customFields: customFields ? JSON.parse(JSON.stringify(customFields)) : null,
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              slug: true,
              startDate: true,
              endDate: true,
              venue: true,
              city: true,
              banner: true,
              format: true,
            },
          },
          ticketType: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      })
    })

    // Send confirmation email
    try {
      await sendRegistrationConfirmationEmail({
        to: session.user.email!,
        userName: attendeeDetails?.name || session.user.name || 'Attendee',
        eventName: event.name,
        eventDate: event.startDate,
        eventVenue: event.venue,
        eventCity: event.city,
        ticketType: ticketType?.name || 'General Admission',
        registrationId: registration.id,
        qrCode: registration.qrCode,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      registration: {
        ...registration,
        ticketType: ticketType
          ? {
              ...ticketType,
              price: Number(ticketType.price),
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to complete registration' },
      { status: 500 }
    )
  }
}

// GET /api/events/[eventId]/register - Check registration status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { eventId } = params

    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            startDate: true,
            endDate: true,
            venue: true,
            city: true,
            banner: true,
            format: true,
          },
        },
        ticketType: true,
      },
    })

    if (!registration) {
      return NextResponse.json({ registered: false })
    }

    return NextResponse.json({
      registered: true,
      registration: {
        ...registration,
        ticketType: registration.ticketType
          ? {
              ...registration.ticketType,
              price: Number(registration.ticketType.price),
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error checking registration:', error)
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    )
  }
}
