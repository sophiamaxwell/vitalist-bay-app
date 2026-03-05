// Email utilities for registration confirmations

interface RegistrationEmailParams {
  to: string
  userName: string
  eventName: string
  eventDate: Date
  eventVenue: string | null
  eventCity: string | null
  ticketType: string
  registrationId: string
  qrCode: string
}

export async function sendRegistrationConfirmationEmail(params: RegistrationEmailParams) {
  const {
    to,
    userName,
    eventName,
    eventDate,
    eventVenue,
    eventCity,
    ticketType,
    registrationId,
    qrCode,
  } = params

  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(eventDate)

  const location = [eventVenue, eventCity].filter(Boolean).join(', ') || 'TBA'

  // For development, log the confirmation
  if (process.env.NODE_ENV === 'development') {
    console.log('═'.repeat(60))
    console.log('📧 REGISTRATION CONFIRMATION EMAIL')
    console.log(`   To: ${to}`)
    console.log(`   User: ${userName}`)
    console.log(`   Event: ${eventName}`)
    console.log(`   Date: ${formattedDate}`)
    console.log(`   Location: ${location}`)
    console.log(`   Ticket: ${ticketType}`)
    console.log(`   Registration ID: ${registrationId}`)
    console.log(`   QR Code: ${qrCode}`)
    console.log('═'.repeat(60))
    return
  }

  // In production, send actual email using nodemailer
  if (process.env.EMAIL_SERVER_HOST) {
    const nodemailer = await import('nodemailer')
    
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    await transport.sendMail({
      to,
      from: process.env.EMAIL_FROM || 'noreply@vitalistbay.com',
      subject: `You're registered for ${eventName}! 🎉`,
      text: `
Hi ${userName}!

You're all set for ${eventName}!

Event Details:
- Date: ${formattedDate}
- Location: ${location}
- Ticket Type: ${ticketType}

Your Registration ID: ${registrationId}

Use this QR code for check-in: ${qrCode}

We can't wait to see you there!

Best regards,
The Vitalist Bay Team
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8faf9; padding: 40px 20px; margin: 0;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #00b894, #00cec9); padding: 40px; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0 0 8px 0;">You're In! 🎉</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Registration Confirmed</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px;">
                <p style="color: #2c3e50; font-size: 18px; margin: 0 0 24px 0;">Hi ${userName}!</p>
                
                <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                  You're all set for <strong style="color: #2c3e50;">${eventName}</strong>. We can't wait to see you there!
                </p>
                
                <!-- Event Card -->
                <div style="background: #f8faf9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                  <h3 style="color: #2c3e50; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Event Details</h3>
                  
                  <div style="margin-bottom: 12px;">
                    <span style="color: #64748b; font-size: 14px;">📅 Date</span>
                    <p style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 4px 0 0 0;">${formattedDate}</p>
                  </div>
                  
                  <div style="margin-bottom: 12px;">
                    <span style="color: #64748b; font-size: 14px;">📍 Location</span>
                    <p style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 4px 0 0 0;">${location}</p>
                  </div>
                  
                  <div>
                    <span style="color: #64748b; font-size: 14px;">🎫 Ticket</span>
                    <p style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 4px 0 0 0;">${ticketType}</p>
                  </div>
                </div>
                
                <!-- Registration Info -->
                <div style="background: #fff8e7; border-radius: 12px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #f59e0b;">
                  <p style="color: #92400e; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">Your Registration ID</p>
                  <p style="color: #2c3e50; font-size: 18px; font-weight: 700; font-family: monospace; margin: 0;">${registrationId}</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0;">
                  Show this email or your QR code at check-in.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: #f8faf9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  Questions? Reply to this email or visit our support center.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
  }
}
