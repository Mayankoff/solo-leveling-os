import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL || ''
  
  // Strip surrounding quotes if Next.js didn't strip them automatically
  connectionString = connectionString.replace(/^"|"$/g, '')
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is completely missing or empty! typeof: " + typeof process.env.DATABASE_URL)
  }
  
  if (connectionString.includes("undefined")) {
    throw new Error("DATABASE_URL contains 'undefined': " + connectionString)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db
