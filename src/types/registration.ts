// Registration Types

export interface TicketTypeWithAvailability {
  id: string
  eventId: string
  name: string
  description: string | null
  price: number
  currency: string
  quantity: number | null
  soldCount: number
  available: number | null // null = unlimited
  allowNetworking: boolean
  allowMeetings: boolean
  allowExhibitorChat: boolean
  saleStart: Date | null
  saleEnd: Date | null
  isActive: boolean
}

export interface RegistrationWithDetails {
  id: string
  eventId: string
  userId: string
  ticketTypeId: string | null
  status: RegistrationStatus
  qrCode: string
  checkedIn: boolean
  checkedInAt: Date | null
  customFields: Record<string, unknown> | null
  paymentStatus: PaymentStatus
  paymentId: string | null
  createdAt: Date
  updatedAt: Date
  event?: {
    id: string
    name: string
    slug: string
    startDate: Date
    endDate: Date
    venue: string | null
    city: string | null
    banner: string | null
    format: string
  }
  ticketType?: TicketTypeWithAvailability | null
  user?: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'FREE'

export interface RegistrationFormData {
  ticketTypeId: string
  attendeeDetails: {
    name: string
    email: string
    company?: string
    jobTitle?: string
    phone?: string
    dietaryRestrictions?: string
    accessibilityNeeds?: string
  }
  customFields?: Record<string, unknown>
}

export interface RegistrationResponse {
  success: boolean
  registration?: RegistrationWithDetails
  error?: string
}
