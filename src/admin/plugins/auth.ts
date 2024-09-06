// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Plugins Imports
import { jwtPlugin } from './jwt'

const authPlugin = (app: Elysia) =>
    app.use(jwtPlugin).derive(async ({ jwtAccessToken, error, path, headers }) => {
        if (path === '/api/admin/auth/sign-in' || path === '/api/admin/auth/refresh') return

        const authorization = headers['authorization']

        if (!authorization) throw error('Unauthorized')

        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

        if (!token) throw error('Unauthorized')

        const jwtPayload = await jwtAccessToken.verify(token)

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
