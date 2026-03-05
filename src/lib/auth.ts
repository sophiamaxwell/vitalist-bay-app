import NextAuth, { type NextAuthConfig, type User } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Extend the User type to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      avatar?: string | null
      role: 'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'
    }
  }

  interface User {
    role?: 'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'
    avatar?: string | null
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'
    avatar?: string | null
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
    newUser: '/onboarding',
  },
  providers: [
    // Primary: Magic Link Email
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@vitalistbay.com',
      maxAge: 10 * 60, // Magic link valid for 10 minutes
      // Custom email template
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url)
        
        // For development, log the magic link
        if (process.env.NODE_ENV === 'development') {
          console.log('═'.repeat(60))
          console.log('🔗 MAGIC LINK (development mode)')
          console.log(`   Email: ${identifier}`)
          console.log(`   URL: ${url}`)
          console.log('═'.repeat(60))
        }
        
        // In production, send actual email
        if (process.env.NODE_ENV === 'production' && process.env.EMAIL_SERVER_HOST) {
          // Dynamic import for nodemailer - ensure it's installed: npm i nodemailer
          const nodemailer = await import('nodemailer')
          const transport = nodemailer.createTransport(provider.server as Record<string, unknown>)
          
          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Sign in to Vitalist Bay Events`,
            text: `Sign in to Vitalist Bay Events\n\nClick here to sign in: ${url}\n\nThis link expires in 10 minutes.\n\nIf you did not request this email, you can safely ignore it.`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8faf9; padding: 40px 20px;">
                  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 40px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #2c3e50; font-size: 24px; margin: 0;">Vitalist Bay Events</h1>
                    </div>
                    <h2 style="color: #2c3e50; font-size: 20px; text-align: center; margin-bottom: 24px;">Sign in to your account</h2>
                    <p style="color: #64748b; text-align: center; margin-bottom: 32px;">Click the button below to sign in. This link expires in 10 minutes.</p>
                    <div style="text-align: center; margin-bottom: 32px;">
                      <a href="${url}" style="display: inline-block; background-color: #00b894; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Sign in</a>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; text-align: center;">If you didn't request this email, you can safely ignore it.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">${host}</p>
                  </div>
                </body>
              </html>
            `,
          })
        }
      },
    }),
    
    // Secondary: Credentials (password) login
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id as string
        token.role = (user.role || 'ATTENDEE') as 'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'
        token.avatar = user.avatar as string | null | undefined
      }

      // Update session
      if (trigger === 'update' && session) {
        token.name = session.name ?? token.name
        token.avatar = session.avatar ?? token.avatar
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as 'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'
        session.user.avatar = token.avatar as string | null | undefined
      }
      return session
    },
    async signIn({ user, account }) {
      // Allow OAuth/Email signins
      if (account?.provider !== 'credentials') {
        return true
      }
      
      // For credentials, verify email is verified
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        
        // Allow signin even without email verification for now
        // Add stricter verification later if needed
        return !!dbUser
      }
      
      return false
    },
  },
  events: {
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
    },
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed in: ${user.email}`)
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
