import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/user/registrations - Get all registrations for the current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const registrations = await prisma.registration.findMany({
      where: {
        userId: session.user.id,
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
        ticketType: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform ticket price to number
    const transformedRegistrations = registrations.map((reg) => ({
      ...reg,
      ticketType: reg.ticketType
        ? {
            ...reg.ticketType,
            price: Number(reg.ticketType.price),
          }
        : null,
    }))

    return NextResponse.json({
      registrations: transformedRegistrations,
    })
  } catch (error) {
    console.error('Error fetching user registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}
