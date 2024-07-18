// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Database Imports
import { db } from '@src/database/drizzle'
import { adminsSchema } from '@src/database/drizzle/schema'

// ** Drizzle Imports
import { eq } from 'drizzle-orm'

// ** Plugins Imports
import { jwtPlugin } from './jwt'

const authPlugin = (app: Elysia) =>
    app.use(jwtPlugin).derive(async ({ jwt, cookie: { accessTokenAdmin }, error, path }) => {
        if (path === '/api/admin/auth/sign-in') return

        if (!accessTokenAdmin.value) throw error('Unauthorized')

        const jwtPayload = await jwt.verify(accessTokenAdmin.value)

        if (!jwtPayload) throw error('Unauthorized')

        const user = await db.query.adminsSchema.findFirst({
            where: eq(adminsSchema.id, jwtPayload.sub!)
        })

        if (!user) throw error('Unauthorized')

        return { user }
    })

export { authPlugin }
