// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Utils Imports
import {
    HASH_PASSWORD,
    JWT
} from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Models Imports
import { AuthModels } from './auth.model'

// ** Class Imports
import { UserAuthClass } from './auth.class'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'
import { jwtUserPlugin } from '../plugins/jwt'

export const authSignIn = new Elysia()
    .decorate({
        UserAuthClass: new UserAuthClass()
    })
    .use(AuthModels)
    .use(jwtUserPlugin)
    .post(
        '/sign-in',
        async ({ UserAuthClass, body, error, jwtAccessToken, jwtRefreshToken, cookie }) => {
            try {
                const user = await prismaClient.users.findFirst({
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

                const passwordMatches = await Bun.password.verify(
                    body.password,
                    user.password as string,
                    HASH_PASSWORD.ALGORITHM
                )

                if (!passwordMatches) throw error('Bad Request')

                const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

                return await UserAuthClass.setCookie(user.id, jwtAccessToken, jwtRefreshToken, cookie, expireAt)
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'signIn'
        }
    )

export const authSignUp = new Elysia()
    .decorate({
        UserAuthClass: new UserAuthClass()
    })
    .use(AuthModels)
    .use(jwtUserPlugin)
    .post(
        '/sign-up',
        async ({ UserAuthClass, body, error, jwtAccessToken, jwtRefreshToken, cookie }) => {
            try {
                const existingUser = await prismaClient.users.findUnique({
                    where: {
                        email: body.email
                    },
                    select: {
                        id: true
                    }
                })

                if (existingUser) throw error('Conflict')

                const hashPassword = await UserAuthClass.hashData(body.password)

                const user = await prismaClient.users.create({
                    data: {
                        ...body,
                        password: hashPassword
                    },
                    select: {
                        id: true
                    }
                })

                const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

                return await UserAuthClass.setCookie(user.id, jwtAccessToken, jwtRefreshToken, cookie, expireAt)
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'signUp'
        }
    )

export const authProfile = new Elysia()
    .use(authUserPlugin)
    .get(
        '/profile',
        async ({ user, error }) => {
            try {
                if (!user || !user.id) throw error('Not Found')

                return await prismaClient.users.findFirst({
                    where: { id: user.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        image_uri: true,
                        email_verified: true
                    }
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        }
    )

export const authSignout = new Elysia()
    .use(authUserPlugin)
    .get(
        '/sign-out',
        async ({ user, error, cookie }) => {
            try {
                cookie.accessToken.remove()
                cookie.refreshToken.remove()

                if (!user || !user.id) throw error('Not Found')

                return await prismaClient.users.update({
                    where: { id: user.id },
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
        }
    )

export const authForgotPassword = new Elysia()
    .decorate({
        UserAuthClass: new UserAuthClass()
    })
    .use(AuthModels)
    .post(
        '/forgot-password',
        async ({ error, body, UserAuthClass }) => {
            const user = await prismaClient.users.findUnique({
                where: {
                    deleted_flg: false,
                    email: body.email
                },
                select: {
                    id: true,
                    name: true,
                    last_password_reset: true
                }
            })

            if (!user) {
                throw error('Not Found')
            }

            const now = new Date()
            const PASSWORD_RESET_INTERVAL = 15

            if (
                user.last_password_reset &&
                UserAuthClass.addMinutesToDate(user.last_password_reset, PASSWORD_RESET_INTERVAL) > now
            ) {
                throw error('Forbidden')
            }

            try {
                const token = createId()

                await prismaClient.passwordResetToken.create({
                    data: {
                        user_id: user.id,
                        token,
                        expires_at: UserAuthClass.addHoursToDate(new Date(), 1)
                    }
                })

                await prismaClient.users.update({
                    where: { id: user.id },
                    data: { last_password_reset: now }
                })

                const resetLink = `${Bun.env.USER_URL}/reset-password?token=${token}`

                const emailContent = UserAuthClass.compileEmailTemplate('src/templates/reset-password.hbs', {
                    name: user.name,
                    resetLink
                })

                await UserAuthClass.sendResetPasswordEmail(body.email, emailContent)

                return { message: 'success' }
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'forgotPassword'
        }
    )

export const authResetPassword = new Elysia()
    .decorate({
        UserAuthClass: new UserAuthClass()
    })
    .use(AuthModels)
    .post(
        '/reset-password',
        async ({ error, body, query, UserAuthClass }) => {
            try {
                const resetToken = await prismaClient.passwordResetToken.findFirst({
                    where: { token: query.token },
                    include: { users: true }
                })

                if (!resetToken || resetToken.expires_at < new Date()) {
                    throw error('Bad Request')
                }

                const hashedPassword = await UserAuthClass.hashData(body.password)

                await prismaClient.users.update({
                    where: { id: resetToken.user_id },
                    data: { password: hashedPassword }
                })

                await prismaClient.passwordResetToken.delete({
                    where: { id: resetToken.id }
                })

                return { message: 'success' }
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'resetPassword',
            query: 'resetPasswordToken'
        }
    )

export const authChangePassword = new Elysia()
    .decorate({
        UserAuthClass: new UserAuthClass()
    })
    .use(authUserPlugin)
    .use(AuthModels)
    .post(
        '/change-password',
        async ({ body, error, user, UserAuthClass }) => {
            if (body.password !== body.confirm_password) {
                throw error('Bad Request')
            }

            const users = await prismaClient.users.findUnique({
                where: { id: user?.id },
                select: { password: true }
            })

            if (!users) {
                throw error('Not Found')
            }

            const passwordMatches = await Bun.password.verify(
                body.old_password as string,
                users.password as string,
                HASH_PASSWORD.ALGORITHM
            )

            if (!passwordMatches) throw error('Bad Request')

            try {
                const hashedPassword = await UserAuthClass.hashData(body.password)

                return await prismaClient.users.update({
                    where: { id: user?.id },
                    data: { password: hashedPassword },
                    select: { id: true }
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'changePassword'
        }
    )

export const authRefreshToken = new Elysia()
    .decorate({
        UserAuthClass: new UserAuthClass()
    })
    .use(authUserPlugin)
    .use(AuthModels)
    .get(
        '/refresh',
        async ({ error, cookie, jwtAccessToken, jwtRefreshToken, UserAuthClass }) => {
            if (!cookie.refreshToken.value) throw error('Forbidden')

            const jwtPayload = await jwtRefreshToken.verify(cookie.refreshToken.value)

            if (!jwtPayload || typeof jwtPayload.sub !== 'string') throw error('Unauthorized')

            const users = await prismaClient.users.findFirst({
                where: { id: jwtPayload.sub },
                select: {
                    id: true,
                    refresh_token: true,
                    refresh_token_expire: true
                }
            })

            if (!users || !users.refresh_token) throw error('Forbidden')

            const refreshTokenMatches = await Bun.password.verify(
                cookie.refreshToken.value,
                users.refresh_token,
                HASH_PASSWORD.ALGORITHM
            )

            if (!refreshTokenMatches) throw error('Forbidden')

            const response = {
                id: users.id,
                refresh_token_expire: users.refresh_token_expire
            }

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

            await UserAuthClass.updateRefreshToken(response.id, refreshTokenJWT)

            return {
                token: {
                    accessToken: accessTokenJWT,
                    refreshToken: refreshTokenJWT
                }
            }
        }
    )
