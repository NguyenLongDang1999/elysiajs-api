// ** Drizzle Imports
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

// ** Schema Imports
import { systemSettingsSchema } from '../schema/system-settings'

const pool = new Pool({
    connectionString: Bun.env.DATABASE_URL
})

const db = drizzle(pool)

async function main() {
    console.log('Starting seed...')

    await db.insert(systemSettingsSchema).values([
        {
            label: 'BUNNY CDN Access Key',
            key: 'secret_key_bunnycdn_access_key',
            value: '...',
            input_type: 10
        },
        {
            label: 'BUNNY CDN Storage Name',
            key: 'secret_key_bunnycdn_storage_name',
            value: 'images-data',
            input_type: 10
        },
        {
            label: 'BUNNY CDN Storage Zone',
            key: 'secret_key_bunnycdn_storage_zone',
            value: 'sg',
            input_type: 10
        }
    ])

    console.log('Seed complete.')
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(0)
})
