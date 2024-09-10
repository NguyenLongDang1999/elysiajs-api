// ** Elysia Imports
import { Cookie, error } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IAuthSignInDTO, IAuthJwt } from './auth.type'

// ** Utils Imports
import { HASH_PASSWORD, JWT } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class AuthService {
    async seed() {
        try {
            await prismaClient.admins.deleteMany({
                where: { email: 'longdang0412@gmail.com' }
            })

            const hashPassword = await Bun.password.hash('dang04121999', {
                algorithm: HASH_PASSWORD.ALGORITHM
            })

            await prismaClient.admins.create({
                data: {
                    name: 'Administrator',
                    email: 'longdang0412@gmail.com',
                    phone: '0389747179',
                    role: 10,
                    password: hashPassword
                }
            })

            await prismaClient.systemSettings.createMany({
                data: [
                    {
                        label: 'BUNNY CDN Access Key',
                        key: 'secret_key_bunnycdn_access_key',
                        value: '...',
                        input_type: 10
                    },
                    {
                        label: 'BUNNY CDN Storage Name',
                        key: 'secret_key_bunnycdn_storage_name',
                        value: 'images-data',
                        input_type: 10
                    },
                    {
                        label: 'BUNNY CDN Storage Zone',
                        key: 'secret_key_bunnycdn_storage_zone',
                        value: 'sg',
                        input_type: 10
                    }
                ]
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async signIn(
        data: IAuthSignInDTO,
        jwtAccessToken: IAuthJwt,
        jwtRefreshToken: IAuthJwt,
        cookie: Record<string, Cookie<any>>
    ) {
        try {
            const user = await prismaClient.admins.findFirst({
                where: {
                    email: data.email,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    password: true
                }
            })

            if (!user) throw error('Not Found')

            const passwordMatches = await Bun.password.verify(data.password, user.password, HASH_PASSWORD.ALGORITHM)

            if (!passwordMatches) throw error('Bad Request')

            const expireAt = new Date(Date.now() + JWT.REFRESH_TOKEN_EXP * 1000)

            await this.setCookie(user.id, jwtAccessToken, jwtRefreshToken, cookie, expireAt)

            return { message: 'success' }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async setCookie(
        user_id: string,
        jwtAccessToken: IAuthJwt,
        jwtRefreshToken: IAuthJwt,
        cookie: Record<string, Cookie<any>>,
        expireAt?: Date
    ) {
        const accessTokenJWT = await jwtAccessToken.sign({
            sub: user_id
        })

        cookie.accessTokenAdmin.set({
            value: accessTokenJWT,
            maxAge: Number(JWT.ACCESS_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production'
        })

        const refreshTokenJWT = await jwtRefreshToken.sign({
            sub: user_id
        })

        cookie.refreshTokenAdmin.set({
            value: refreshTokenJWT,
            maxAge: Number(JWT.REFRESH_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production'
        })

        await this.updateRefreshToken(user_id, refreshTokenJWT, expireAt)
    }

    hashData(data: string) {
        return Bun.password.hash(data, {
            algorithm: HASH_PASSWORD.ALGORITHM
        })
    }

    async refresh(jwtAccessToken: IAuthJwt, jwtRefreshToken: IAuthJwt, cookie: Record<string, Cookie<any>>) {
        if (!cookie.refreshTokenAdmin.value) throw error('Forbidden')

        const jwtPayload = await jwtRefreshToken.verify(cookie.refreshTokenAdmin.value)

        if (!jwtPayload || typeof jwtPayload.sub !== 'string') throw error('Unauthorized')

        const response = await this.refreshTokens(jwtPayload.sub, cookie.refreshTokenAdmin.value)

        if (!response || !response.id) throw error('Not Found')

        await this.setCookie(response.id, jwtAccessToken, jwtRefreshToken, cookie)

        return { message: 'success' }
    }

    async updateRefreshToken(userId: string, refreshToken: string, expireAt?: Date) {
        try {
            const hashedRefreshToken = await this.hashData(refreshToken)

            await prismaClient.admins.update({
                where: { id: userId },
                data: {
                    refresh_token: hashedRefreshToken,
                    refresh_token_expire: expireAt
                },
                select: {
                    id: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async refreshTokens(id: string, refreshToken: string) {
        try {
            const user = await prismaClient.admins.findFirst({
                where: { id },
                select: {
                    id: true,
                    refresh_token: true,
                    refresh_token_expire: true
                }
            })

            if (!user || !user.refresh_token) throw error('Forbidden')

            const refreshTokenMatches = await Bun.password.verify(
                refreshToken,
                user.refresh_token,
                HASH_PASSWORD.ALGORITHM
            )

            if (!refreshTokenMatches) throw error('Forbidden')

            return {
                id: user.id,
                refresh_token_expire: user.refresh_token_expire
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async signOut(cookie: Record<string, Cookie<any>>, user_id?: string) {
        try {
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
    }

    async profile(user_id?: string) {
        try {
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
    }
}
