import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Update check-in status manually (check-in or undo check-in)
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; registrationId: string } }
) {
  try {
    const { eventId, registrationId } = params
    const body = await request.json()
    const { checkedIn } = body

    // Verify registration belongs to event
    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        eventId
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Update check-in status
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkedIn: checkedIn,
        checkedInAt: checkedIn ? new Date() : null
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
      }
    })

    return NextResponse.json({
      success: true,
      registration: {
        id: updatedRegistration.id,
        checkedIn: updatedRegistration.checkedIn,
        checkedInAt: updatedRegistration.checkedInAt,
        user: updatedRegistration.user
      }
    })
  } catch (error) {
    console.error('Failed to update check-in:', error)
    return NextResponse.json(
      { error: 'Failed to update check-in status' },
      { status: 500 }
    )
  }
}
