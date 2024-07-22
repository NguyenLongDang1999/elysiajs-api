// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Plugins Imports
import { jwtPlugin } from './jwt'

const authPlugin = (app: Elysia) =>
    app.use(jwtPlugin).derive(async ({ jwt, cookie, error, path }) => {
        if (path === '/api/admin/auth/sign-in' || path === '/api/admin/auth/refresh') return

        if (!cookie.accessTokenAdmin.value) throw error('Unauthorized')

        const jwtPayload = await jwt.verify(cookie.accessTokenAdmin.value)

        if (!jwtPayload) throw error('Unauthorized')

        const user = await prismaClient.admins.findFirst({
            where: { id: jwtPayload.sub },
            select: {
                id: true
            }
        })

        if (!user) throw error('Unauthorized')

        return { user }
    })

export { authPlugin }
