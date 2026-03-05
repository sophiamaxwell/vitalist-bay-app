import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { eventId: string }
}

// GET /api/events/[eventId]/tickets - Get all ticket types for an event
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = params

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, registrationOpen: true },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get all active ticket types with sold counts
    const ticketTypes = await prisma.ticketType.findMany({
      where: {
        eventId,
        isActive: true,
      },
      orderBy: [
        { price: 'asc' },
        { name: 'asc' },
      ],
    })

    // Transform to include availability
    const ticketTypesWithAvailability = ticketTypes.map((ticket) => ({
      id: ticket.id,
      eventId: ticket.eventId,
      name: ticket.name,
      description: ticket.description,
      price: Number(ticket.price),
      currency: ticket.currency,
      quantity: ticket.quantity,
      soldCount: ticket.soldCount,
      available: ticket.quantity !== null ? ticket.quantity - ticket.soldCount : null,
      allowNetworking: ticket.allowNetworking,
      allowMeetings: ticket.allowMeetings,
      allowExhibitorChat: ticket.allowExhibitorChat,
      saleStart: ticket.saleStart,
      saleEnd: ticket.saleEnd,
      isActive: ticket.isActive,
      // Check if ticket is currently on sale
      isOnSale: isTicketOnSale(ticket),
    }))

    return NextResponse.json({
      tickets: ticketTypesWithAvailability,
      registrationOpen: event.registrationOpen,
    })
  } catch (error) {
    console.error('Error fetching ticket types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket types' },
      { status: 500 }
    )
  }
}

function isTicketOnSale(ticket: {
  isActive: boolean
  saleStart: Date | null
  saleEnd: Date | null
  quantity: number | null
  soldCount: number
}): boolean {
  if (!ticket.isActive) return false
  
  const now = new Date()
  
  if (ticket.saleStart && now < ticket.saleStart) return false
  if (ticket.saleEnd && now > ticket.saleEnd) return false
  if (ticket.quantity !== null && ticket.soldCount >= ticket.quantity) return false
  
  return true
}
