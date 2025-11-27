import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Export a mutable prisma binding so we can reinitialize on connection errors
export let prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function resetPrismaClient() {
  try {
    await prisma.$disconnect()
  } catch (e) {
    // ignore
  }
  prisma = new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  return prisma
}

export async function withPrismaRetry(fn: (p: PrismaClient) => Promise<any>, retries = 1) {
  try {
    return await fn(prisma)
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (retries > 0 && (msg.includes('prepared statement') || msg.includes('prepared statements'))) {
      console.warn('withPrismaRetry detected prepared-statement error, resetting client and retrying...')
      await resetPrismaClient()
      return withPrismaRetry(fn, retries - 1)
    }
    throw err
  }
}