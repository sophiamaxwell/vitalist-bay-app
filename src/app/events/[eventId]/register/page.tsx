'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import type { TicketTypeWithAvailability } from '@/types/registration'

interface RegistrationPageProps {
  params: { eventId: string }
}

interface TicketResponse {
  tickets: (TicketTypeWithAvailability & { isOnSale: boolean })[]
  registrationOpen: boolean
}

export default function RegistrationPage({ params }: RegistrationPageProps) {
  const { eventId } = params
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [step, setStep] = useState(1)
  const [tickets, setTickets] = useState<TicketResponse['tickets']>([])
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    phone: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
  })

  // Check if already registered
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/events/${eventId}/register`)
      return
    }
    
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }))
    }
  }, [session, status, eventId, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check existing registration
        const regRes = await fetch(`/api/events/${eventId}/register`)
        if (regRes.ok) {
          const regData = await regRes.json()
          if (regData.registered) {
            setAlreadyRegistered(true)
            router.push(`/events/${eventId}/register/confirmation?id=${regData.registration.id}`)
            return
          }
        }

        // Fetch tickets
        const ticketRes = await fetch(`/api/events/${eventId}/tickets`)
        if (!ticketRes.ok) throw new Error('Failed to load tickets')
        
        const ticketData: TicketResponse = await ticketRes.json()
        setTickets(ticketData.tickets)
        setRegistrationOpen(ticketData.registrationOpen)
        
        // Auto-select if only one ticket
        if (ticketData.tickets.length === 1 && ticketData.tickets[0].isOnSale) {
          setSelectedTicket(ticketData.tickets[0].id)
        }
      } catch (err) {
        setError('Failed to load registration data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    if (status === 'authenticated') {
      fetchData()
    }
  }, [eventId, status, router])

  const handleSubmit = async () => {
    if (!selectedTicket && tickets.length > 0) {
      setError('Please select a ticket type')
      return
    }
    
    if (!formData.name || !formData.email) {
      setError('Name and email are required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: selectedTicket,
          attendeeDetails: {
            name: formData.name,
            email: formData.email,
            company: formData.company || undefined,
            jobTitle: formData.jobTitle || undefined,
            phone: formData.phone || undefined,
            dietaryRestrictions: formData.dietaryRestrictions || undefined,
            accessibilityNeeds: formData.accessibilityNeeds || undefined,
          },
          customFields: {
            dietaryRestrictions: formData.dietaryRestrictions,
            accessibilityNeeds: formData.accessibilityNeeds,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Redirect to confirmation
      router.push(`/events/${eventId}/register/confirmation?id=${data.registration.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading registration...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (alreadyRegistered) {
    return null // Redirecting
  }

  if (!registrationOpen) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Closed</h2>
            <p className="text-slate-500 mb-6">
              Registration for this event is currently closed.
            </p>
            <Link href={`/events/${eventId}`}>
              <Button variant="secondary">Back to Event</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 px-0 sm:px-4">
      {/* Progress Steps - Mobile optimized */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <div className="flex items-center justify-between sm:justify-center sm:gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
              {step > 1 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : '1'}
            </div>
            <span className="font-medium text-sm hidden sm:inline">Select Ticket</span>
          </div>
          <div className={`flex-1 sm:flex-none sm:w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
              {step > 2 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : '2'}
            </div>
            <span className="font-medium text-sm hidden sm:inline">Your Details</span>
          </div>
          <div className={`flex-1 sm:flex-none sm:w-12 h-0.5 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
              3
            </div>
            <span className="font-medium text-sm hidden sm:inline">Confirm</span>
          </div>
        </div>
        {/* Mobile step label */}
        <div className="text-center mt-3 sm:hidden">
          <span className="text-sm font-medium text-slate-600">
            {step === 1 ? 'Select Ticket' : step === 2 ? 'Your Details' : 'Confirm & Pay'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Ticket Selection */}
      {step === 1 && (
        <Card className="mx-4 sm:mx-0 rounded-2xl sm:rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Select Your Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No tickets available at this time.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => ticket.isOnSale && setSelectedTicket(ticket.id)}
                  className={`
                    p-4 rounded-2xl sm:rounded-xl border-2 transition-all cursor-pointer touch-interactive
                    ${selectedTicket === ticket.id 
                      ? 'border-primary bg-primary-50' 
                      : ticket.isOnSale 
                        ? 'border-slate-200 active:border-slate-300 active:bg-slate-50' 
                        : 'border-slate-200 opacity-50 cursor-not-allowed'}
                  `}
                >
                  {/* Mobile-first layout */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Radio indicator - larger for touch */}
                    <div className={`w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedTicket === ticket.id ? 'border-primary' : 'border-slate-300'}`}>
                      {selectedTicket === ticket.id && (
                        <div className="w-3.5 h-3.5 rounded-full bg-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-base sm:text-lg text-slate-900">{ticket.name}</h3>
                            {!ticket.isOnSale && (
                              <Badge variant="secondary" className="text-xs">Sold Out</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-slate-900">
                            {formatPrice(ticket.price, ticket.currency)}
                          </div>
                          {ticket.available !== null && ticket.available > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {ticket.available} left
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {ticket.description && (
                        <p className="text-slate-500 text-sm mb-2">{ticket.description}</p>
                      )}
                      
                      {/* Features - horizontal scroll on mobile */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                        {ticket.allowNetworking && (
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 whitespace-nowrap">
                            ✓ Networking
                          </span>
                        )}
                        {ticket.allowMeetings && (
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 whitespace-nowrap">
                            ✓ 1:1 Meetings
                          </span>
                        )}
                        {ticket.allowExhibitorChat && (
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 whitespace-nowrap">
                            ✓ Exhibitor Chat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Mobile-sticky footer buttons */}
            <div className="pt-4 flex gap-3 sm:justify-between">
              <Link href={`/events/${eventId}`} className="flex-1 sm:flex-none">
                <Button variant="ghost" className="w-full h-12 sm:h-10 touch-interactive">Cancel</Button>
              </Link>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedTicket && tickets.length > 0}
                className="flex-1 sm:flex-none h-12 sm:h-10 touch-interactive"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Attendee Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                disabled
                hint="Email from your account"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Your company"
              />
              <Input
                label="Job Title"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Your role"
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />

            <Textarea
              label="Dietary Restrictions"
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              placeholder="Any dietary requirements..."
              rows={2}
            />

            <Textarea
              label="Accessibility Needs"
              value={formData.accessibilityNeeds}
              onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
              placeholder="Any accessibility requirements..."
              rows={2}
            />

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!formData.name || !formData.email}
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Ticket */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="text-sm font-medium text-slate-500 mb-2">Selected Ticket</h4>
              {selectedTicket && tickets.find(t => t.id === selectedTicket) && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">
                    {tickets.find(t => t.id === selectedTicket)?.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(
                      tickets.find(t => t.id === selectedTicket)?.price || 0,
                      tickets.find(t => t.id === selectedTicket)?.currency || 'USD'
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Attendee Info */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="text-sm font-medium text-slate-500 mb-3">Attendee Information</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-medium text-slate-900">{formData.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-900">{formData.email}</dd>
                </div>
                {formData.company && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Company</dt>
                    <dd className="font-medium text-slate-900">{formData.company}</dd>
                  </div>
                )}
                {formData.jobTitle && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Job Title</dt>
                    <dd className="font-medium text-slate-900">{formData.jobTitle}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Terms */}
            <p className="text-sm text-slate-500 text-center">
              By registering, you agree to the event terms and conditions.
            </p>

            <div className="pt-4 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting}
              >
                {submitting ? 'Registering...' : 'Complete Registration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
