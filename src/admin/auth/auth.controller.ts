// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { AuthModels } from './auth.model'

// ** Service Imports
import { AuthService } from './auth.service'

// ** Utils Imports
import { JWT } from '@src/utils/enums'

// ** Plugins Imports
import { authPlugin } from '../plugins/auth'
import { jwtPlugin } from '../plugins/jwt'

export const authController = new Elysia({ prefix: '/auth' })
    .decorate({
        AuthService: new AuthService()
    })
    .use(AuthModels)
    .use(jwtPlugin)
    .post(
        'sign-in',
        async ({ AuthService, body, jwtAccessToken, jwtRefreshToken, cookie }) => {
            const { id } = await AuthService.signIn(body)

            const accessTokenJWT = await jwtAccessToken.sign({
                sub: id
            })

            const refreshTokenJWT = await jwtRefreshToken.sign({
                sub: id
            })

            cookie.refreshTokenAdmin.set({
                value: refreshTokenJWT,
                maxAge: Number(JWT.REFRESH_TOKEN_EXP),
                secure: Bun.env.NODE_ENV === 'production',
                httpOnly: Bun.env.NODE_ENV === 'production',
                sameSite: Bun.env.NODE_ENV === 'production'
            })

            await AuthService.updateRefreshToken(id, refreshTokenJWT)

            return { accessToken: accessTokenJWT }
        },
        {
            body: 'signIn'
        }
    )
    .get('refresh', async ({ AuthService, jwtAccessToken, jwtRefreshToken, error, cookie }) => {
        if (!cookie.refreshTokenAdmin.value) throw error('Forbidden')

        const jwtPayload = await jwtRefreshToken.verify(cookie.refreshTokenAdmin.value)

        if (!jwtPayload || typeof jwtPayload.sub !== 'string') throw error('Unauthorized')

        const response = await AuthService.refreshTokens(jwtPayload.sub, cookie.refreshTokenAdmin.value)

        if (!response || !response.id) throw error('Not Found')

        const accessTokenJWT = await jwtAccessToken.sign({
            sub: response.id
        })

        const refreshTokenJWT = await jwtRefreshToken.sign({
            sub: response.id
        })

        cookie.refreshTokenAdmin.set({
            value: refreshTokenJWT,
            maxAge: Number(JWT.REFRESH_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production'
        })

        await AuthService.updateRefreshToken(response.id, refreshTokenJWT)

        return { accessToken: accessTokenJWT }
    })
    .use(authPlugin)
    .get('sign-out', async ({ AuthService, user, cookie, error }) => {
        cookie.refreshTokenAdmin.remove()

        if (!user || !user.id) throw error('Not Found')

        return AuthService.signOut(user.id)
    })
    .get('profile', ({ AuthService, user, error }) => {
        if (!user || !user.id) throw error('Not Found')

        return AuthService.profile(user.id)
    })
