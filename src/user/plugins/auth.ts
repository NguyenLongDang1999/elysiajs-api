// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Plugins Imports
import { jwtUserPlugin } from './jwt'

const authUserPlugin = (app: Elysia) =>
    app.use(jwtUserPlugin).derive(async ({ jwtAccessToken, error, path, headers }) => {
        if (path === '/api/user/auth/sign-in' || path === '/api/user/auth/refresh') return

        const authorization = headers['authorization']

        if (!authorization) throw error('Unauthorized')

        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

        if (!token) throw error('Unauthorized')

        const jwtPayload = await jwtAccessToken.verify(token)

        if (!jwtPayload) throw error('Unauthorized')

        const user = await prismaClient.users.findFirst({
            where: { id: jwtPayload.sub },
            select: {
                id: true
            }
        })

        if (!user) throw error('Unauthorized')

        return { user }
    })

export { authUserPlugin }

