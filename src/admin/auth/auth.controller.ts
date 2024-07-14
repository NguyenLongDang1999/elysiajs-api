// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { AuthModels } from './auth.model'

// ** Service Imports
import { AuthService } from './auth.service'

// ** Utils Imports
import { getExpTimestamp } from '@src/utils'
import { JWT } from '@src/utils/enums'

// ** Plugins Imports
import { jwtPlugin } from '../plugins/jwt'
import { authPlugin } from '../plugins/auth'

export const authController = new Elysia({ prefix: '/auth' })
    .decorate({
        AuthService: new AuthService(),
    })
    .use(jwtPlugin)
    .use(AuthModels)
    .post(
        'sign-in',
        async ({ AuthService, body, jwt, cookie }) => {
            const { id } = await AuthService.signIn(body)

            const accessTokenJWT = await jwt.sign({
                sub: id,
                exp: getExpTimestamp(JWT.ACCESS_TOKEN_EXP),
            })

            cookie.accessTokenAdmin.set({
                value: accessTokenJWT,
                maxAge: Number(JWT.ACCESS_TOKEN_EXP),
                secure: Bun.env.NODE_ENV === 'production',
                httpOnly: Bun.env.NODE_ENV === 'production',
                sameSite: Bun.env.NODE_ENV === 'production',
            })

            const refreshTokenJWT = await jwt.sign({
                sub: id,
                exp: getExpTimestamp(JWT.REFRESH_TOKEN_EXP),
            })

            cookie.refreshTokenAdmin.set({
                value: refreshTokenJWT,
                maxAge: Number(JWT.REFRESH_TOKEN_EXP),
                secure: Bun.env.NODE_ENV === 'production',
                httpOnly: Bun.env.NODE_ENV === 'production',
                sameSite: Bun.env.NODE_ENV === 'production',
            })

            await AuthService.updateRefreshToken(id, refreshTokenJWT)

            return new Response('Successfully!')
        },
        {
            body: 'signIn',
        },
    )
    .get('refresh', async ({ AuthService, jwt, error, cookie }) => {
        if (!cookie.refreshTokenAdmin) throw error('Forbidden')

        const jwtPayload = await jwt.verify(cookie.refreshTokenAdmin.value)

        if (!jwtPayload) throw error('Unauthorized')

        const response = await AuthService.refreshTokens(jwtPayload.sub!, cookie.refreshTokenAdmin.value)

        const accessTokenJWT = await jwt.sign({
            sub: response?.id!,
            exp: getExpTimestamp(JWT.ACCESS_TOKEN_EXP),
        })

        cookie.accessTokenAdmin.set({
            value: accessTokenJWT,
            maxAge: Number(JWT.ACCESS_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production',
        })

        const refreshTokenJWT = await jwt.sign({
            sub: response?.id!,
            exp: getExpTimestamp(JWT.REFRESH_TOKEN_EXP),
        })

        cookie.refreshTokenAdmin.set({
            value: refreshTokenJWT,
            maxAge: Number(JWT.REFRESH_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production',
        })

        await AuthService.updateRefreshToken(response?.id!, refreshTokenJWT)

        return new Response('Successfully!')
    })
    .use(authPlugin)
    .get('sign-out', async ({ AuthService, user, cookie }) => {
        cookie.accessTokenAdmin.remove()
        cookie.refreshTokenAdmin.remove()

        await AuthService.signOut(user?.id!)
        return new Response('Successfully!')
    })
