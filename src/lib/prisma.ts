import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  // Only create pool/adapter when DATABASE_URL is available
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    // Return a minimal client for build time - won't actually connect
    return new PrismaClient()
  }

  // Create PostgreSQL connection pool
  const pool = globalForPrisma.pool ?? new Pool({ 
    connectionString,
    max: 20,
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  // Create Prisma adapter
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
