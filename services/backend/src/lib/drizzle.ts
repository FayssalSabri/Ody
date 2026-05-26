import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema.js'

const connectionString = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/odyssey'

const client = postgres(connectionString, {
  onnotice: (notice) => {
    if (notice.severity && notice.severity !== 'NOTICE' && notice.severity !== 'INFO') {
      console.warn('[postgres]', notice)
    }
  }
})

export const db = drizzle(client, { schema })
