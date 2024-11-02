// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { AuthModels } from './auth.model'

// ** Service Imports
import { AuthService } from './auth.service'

// ** Utils Imports
import { JWT } from '@utils/enums'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'
import { googleUserPlugin } from '../plugins/google'
import { jwtUserPlugin } from '../plugins/jwt'

export const authController = new Elysia({ prefix: '/auth' })
    .decorate({
        UserAuthService: new AuthService()
    })
    .use(AuthModels)
    .use(googleUserPlugin)
    .use(jwtUserPlugin)
    .post(
        'sign-in',
        async ({ UserAuthService, body, jwtAccessToken, jwtRefreshToken, cookie }) => {
            const { id } = await UserAuthService.signIn(body)

            const accessTokenJWT = await jwtAccessToken.sign({ sub: id })

            // cookie.accessToken.set({
            //     value: accessTokenJWT,
            //     maxAge: Number(JWT.ACCESS_TOKEN_EXP),
            //     secure: Bun.env.NODE_ENV === 'production',
            //     httpOnly: Bun.env.NODE_ENV === 'production',
            //     sameSite: Bun.env.NODE_ENV === 'production'
            // })

            const refreshTokenJWT = await jwtRefreshToken.sign({ sub: id })

            // cookie.refreshToken.set({
            //     value: refreshTokenJWT,
            //     maxAge: Number(JWT.REFRESH_TOKEN_EXP),
            //     secure: Bun.env.NODE_ENV === 'production',
            //     httpOnly: Bun.env.NODE_ENV === 'production',
            //     sameSite: Bun.env.NODE_ENV === 'production'
            // })

            const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

            await UserAuthService.updateRefreshToken(id, refreshTokenJWT, expireAt)

            return {
                token: {
                    accessToken: accessTokenJWT,
                    refreshToken: refreshTokenJWT,
                }
            }
        },
        {
            body: 'signIn'
        }
    )
    .post(
        'sign-up',
        async ({ UserAuthService, body, jwtAccessToken, jwtRefreshToken, cookie }) => {
            const { id } = await UserAuthService.signUp(body)

            const accessTokenJWT = await jwtAccessToken.sign({ sub: id })

            cookie.accessToken.set({
                value: accessTokenJWT,
                maxAge: Number(JWT.ACCESS_TOKEN_EXP),
                secure: Bun.env.NODE_ENV === 'production',
                httpOnly: Bun.env.NODE_ENV === 'production',
                sameSite: Bun.env.NODE_ENV === 'production'
            })

            const refreshTokenJWT = await jwtRefreshToken.sign({ sub: id })

            cookie.refreshToken.set({
                value: refreshTokenJWT,
                maxAge: Number(JWT.REFRESH_TOKEN_EXP),
                secure: Bun.env.NODE_ENV === 'production',
                httpOnly: Bun.env.NODE_ENV === 'production',
                sameSite: Bun.env.NODE_ENV === 'production'
            })

            const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

            return await UserAuthService.updateRefreshToken(id, refreshTokenJWT, expireAt)
        },
        {
            body: 'signUp'
        }
    )
    .get('refresh', async ({ UserAuthService, jwtAccessToken, jwtRefreshToken, error, cookie }) => {
        if (!cookie.refreshToken.value) throw error('Forbidden')

        const jwtPayload = await jwtRefreshToken.verify(cookie.refreshToken.value)

        if (!jwtPayload || typeof jwtPayload.sub !== 'string') throw error('Unauthorized')

        const response = await UserAuthService.refreshTokens(jwtPayload.sub, cookie.refreshToken.value)

        if (!response || !response.id) throw error('Not Found')

        const accessTokenJWT = await jwtAccessToken.sign({ sub: response.id })

        cookie.accessToken.set({
            value: accessTokenJWT,
            maxAge: Number(JWT.ACCESS_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production'
        })

        const refreshTokenJWT = await jwtRefreshToken.sign({ sub: response.id })

        cookie.refreshToken.set({
            value: refreshTokenJWT,
            maxAge: Number(JWT.REFRESH_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production'
        })

        return await UserAuthService.updateRefreshToken(response.id, refreshTokenJWT)
    })
    .post('forgot-password', ({ UserAuthService, body }) => UserAuthService.forgotPassword(body), {
        body: 'changePassword'
    })
    .post('reset-password', ({ UserAuthService, query, body }) => UserAuthService.resetPassword(query, body), {
        body: 'resetPassword',
        query: 'resetPasswordToken'
    })
    .use(authUserPlugin)
    .get('sign-out', async ({ UserAuthService, user, error, cookie }) => {
        cookie.accessToken.remove()
        cookie.refreshToken.remove()

        if (!user || !user.id) throw error('Not Found')

        return UserAuthService.signOut(user.id)
    })
    .get('profile', ({ UserAuthService, user, error }) => {
        if (!user || !user.id) throw error('Not Found')

        return UserAuthService.profile(user.id)
    })
