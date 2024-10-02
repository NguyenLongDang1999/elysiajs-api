// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import {
    HASH_PASSWORD,
    JWT
} from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { AuthModels } from './auth.model'

// ** Class Imports
import { AuthClass } from './auth.class'

// ** Plugins Imports
import { authPlugin } from '../plugins/auth'
import { jwtPlugin } from '../plugins/jwt'

export const authSignIn = new Elysia()
    .decorate({
        AuthClass: new AuthClass()
    })
    .use(jwtPlugin)
    .use(AuthModels)
    .post(
        '/sign-in',
        async ({ AuthClass, body, error, cookie, jwtAccessToken, jwtRefreshToken }) => {
            try {
                const user = await prismaClient.admins.findFirst({
                    where: {
                        email: body.email,
                        deleted_flg: false
                    },
                    select: {
                        id: true,
                        password: true
                    }
                })

                if (!user) throw error('Not Found')

                const passwordMatches = await Bun.password.verify(body.password, user.password, HASH_PASSWORD.ALGORITHM)

                if (!passwordMatches) throw error('Bad Request')

                const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

                await AuthClass.setCookie(user.id, jwtAccessToken, jwtRefreshToken, cookie, expireAt)

                return { message: 'success' }
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'signIn'
        }
    )

export const authRefresh = new Elysia()
    .decorate({
        AuthClass: new AuthClass()
    })
    .use(jwtPlugin)
    .get('/refresh', async ({ AuthClass, error, cookie, jwtAccessToken, jwtRefreshToken }) => {
        if (!cookie.refreshTokenAdmin.value) throw error('Forbidden')

        const jwtPayload = await jwtRefreshToken.verify(cookie.refreshTokenAdmin.value)

        if (!jwtPayload || typeof jwtPayload.sub !== 'string') throw error('Unauthorized')

        const user = await prismaClient.admins.findFirst({
            where: { id: jwtPayload.sub },
            select: {
                id: true,
                refresh_token: true,
                refresh_token_expire: true
            }
        })

        if (!user || !user.refresh_token) throw error('Forbidden')

        const refreshTokenMatches = await Bun.password.verify(
            cookie.refreshTokenAdmin.value,
            user.refresh_token,
            HASH_PASSWORD.ALGORITHM
        )

        if (!refreshTokenMatches) throw error('Forbidden')

        await AuthClass.setCookie(user.id, jwtAccessToken, jwtRefreshToken, cookie)

        return { message: 'success' }
    })

export const authSignOut = new Elysia().use(authPlugin).get('/sign-out', async ({ user, cookie, error }) => {
    try {
        const user_id = user?.id

        if (!user_id) throw error('Not Found')

        cookie.accessTokenAdmin.remove()
        cookie.refreshTokenAdmin.remove()

        return await prismaClient.admins.update({
            where: { id: user_id },
            data: {
                refresh_token: null,
                refresh_token_expire: null
            },
            select: {
                id: true
            }
        })
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const authProfile = new Elysia()
    .use(authPlugin)
    .use(AuthModels)
    .get('/profile', async ({ user, error }) => {
        try {
            const user_id = user?.id

            if (!user_id) throw error('Not Found')

            return await prismaClient.admins.findFirst({
                where: { id: user_id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image_uri: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    })
