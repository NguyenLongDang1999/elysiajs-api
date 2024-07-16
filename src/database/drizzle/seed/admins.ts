// ** Drizzle Imports
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

// ** Schema Imports
import { adminsSchema } from '../schema/admins'

const pool = new Pool({
    connectionString: Bun.env.DATABASE_URL
})

const db = drizzle(pool)

async function main() {
    console.log('Starting seed...')

    const hashPassword = await Bun.password.hash('dang04121999', {
        algorithm: 'argon2id'
    })

    await db.insert(adminsSchema).values({
        name: 'Administrator',
        email: 'longdang0412@gmail.com',
        phone: '0389747179',
        role: 10,
        password: hashPassword
    })

    console.log('Seed complete.')
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(0)
})
