import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/odyssey'

export const sql = postgres(connectionString, {
  onnotice: (notice) => {
    if (notice.severity && notice.severity !== 'NOTICE' && notice.severity !== 'INFO') {
      console.warn('[postgres]', notice)
    }
  }
})

export const getDb = () => sql
