// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { AuthModels } from './auth.model'

// ** Service Imports
import { AuthService } from './auth.service'

// ** Utils Imports
import { JWT } from '@src/utils/enums'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'
import { jwtUserPlugin } from '../plugins/jwt'

export const authController = new Elysia({ prefix: '/auth' })
    .decorate({
        UserAuthService: new AuthService()
    })
    .use(AuthModels)
    .use(jwtUserPlugin)
    .post(
        'sign-in',
        async ({ UserAuthService, body, jwtAccessToken, jwtRefreshToken }) => {
            const { id } = await UserAuthService.signIn(body)

            const accessTokenJWT = await jwtAccessToken.sign({ sub: id })
            const refreshTokenJWT = await jwtRefreshToken.sign({ sub: id })

            const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

            await UserAuthService.updateRefreshToken(id, refreshTokenJWT, expireAt)

            return {
                token: {
                    accessToken: accessTokenJWT,
                    refreshToken: refreshTokenJWT
                }
            }
        },
        {
            body: 'signIn'
        }
    )
    .post(
        'sign-up',
        async ({ UserAuthService, body, jwtAccessToken, jwtRefreshToken }) => {
            const { id } = await UserAuthService.signUp(body)

            const accessTokenJWT = await jwtAccessToken.sign({ sub: id })
            const refreshTokenJWT = await jwtRefreshToken.sign({ sub: id })

            const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

            await UserAuthService.updateRefreshToken(id, refreshTokenJWT, expireAt)

            return {
                token: {
                    accessToken: accessTokenJWT,
                    refreshToken: refreshTokenJWT
                }
            }
        },
        {
            body: 'signUp'
        }
    )
    .post('refresh', async ({ UserAuthService, jwtAccessToken, jwtRefreshToken, error, cookie }) => {
        if (!cookie.refreshToken.value) throw error('Forbidden')

        const jwtPayload = await jwtRefreshToken.verify(cookie.refreshToken.value)

        if (!jwtPayload || typeof jwtPayload.sub !== 'string') throw error('Unauthorized')

        const response = await UserAuthService.refreshTokens(jwtPayload.sub, cookie.refreshToken.value)

        if (!response || !response.id) throw error('Not Found')

        const accessTokenJWT = await jwtAccessToken.sign({ sub: response.id })
        const refreshTokenJWT = await jwtRefreshToken.sign({ sub: response.id })

        await UserAuthService.updateRefreshToken(response.id, refreshTokenJWT)

        return {
            token: {
                accessToken: accessTokenJWT,
                refreshToken: refreshTokenJWT
            }
        }
    })
    .use(authUserPlugin)
    .get('session', async ({ jwtAccessToken, headers, error }) => {
        const authorization = headers['authorization']

        if (!authorization) throw error('Unauthorized')

        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

        if (!token) throw error('Unauthorized')

        const jwtPayload = await jwtAccessToken.verify(token)

        if (!jwtPayload) throw error('Unauthorized')

        return jwtPayload
    })
    .get('sign-out', async ({ UserAuthService, user, error }) => {
        if (!user || !user.id) throw error('Not Found')

        return UserAuthService.signOut(user.id)
    })
    .get('profile', ({ UserAuthService, user, error }) => {
        if (!user || !user.id) throw error('Not Found')

        return UserAuthService.profile(user.id)
    })
