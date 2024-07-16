// ** Drizzle Imports
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// ** Schema Definitions Imports
import * as schema from './schema'

const pool = new Pool({
    connectionString: Bun.env.DATABASE_URL
})

export const db = drizzle(pool, { schema })
