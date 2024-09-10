// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { AuthModels } from './auth.model'

// ** Service Imports
import { AuthService } from './auth.service'

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
        ({ AuthService, body, jwtAccessToken, jwtRefreshToken, cookie }) =>
            AuthService.signIn(body, jwtAccessToken, jwtRefreshToken, cookie),
        { body: 'signIn' }
    )
    .get('refresh', async ({ AuthService, jwtAccessToken, jwtRefreshToken, cookie }) =>
        AuthService.refresh(jwtAccessToken, jwtRefreshToken, cookie)
    )
    .use(authPlugin)
    .get('sign-out', async ({ AuthService, user, cookie }) => AuthService.signOut(cookie, user?.id))
    .get('profile', ({ AuthService, user }) => AuthService.profile(user?.id))
