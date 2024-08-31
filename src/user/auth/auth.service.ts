// ** Elysia Imports
import { error } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IAuthSignInDTO, IAuthSignUpDTO } from './auth.type'

// ** Utils Imports
import { HASH_PASSWORD } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class AuthService {
    async signIn(data: IAuthSignInDTO) {
        const user = await prismaClient.users.findFirst({
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

        return { id: user.id }
    }

    async signUp(data: IAuthSignUpDTO) {
        const existingUser = await prismaClient.users.findUnique({
            where: {
                email: data.email
            },
            select: {
                id: true
            }
        })

        if (existingUser) throw error('Conflict')

        const hashPassword = await this.hashData(data.password)

        await prismaClient.users.create({
            data: {
                ...data,
                password: hashPassword
            },
            select: {
                id: true
            }
        })

        return await this.signIn({
            email: data.email,
            password: data.password
        })
    }

    hashData(data: string) {
        return Bun.password.hash(data, {
            algorithm: HASH_PASSWORD.ALGORITHM
        })
    }

    async updateRefreshToken(userId: string, refreshToken: string, expireAt?: Date) {
        try {
            const hashedRefreshToken = await this.hashData(refreshToken)

            return await prismaClient.users.update({
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
            const user = await prismaClient.users.findFirst({
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

    async signOut(userId: string) {
        try {
            return await prismaClient.users.update({
                where: { id: userId },
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

    async profile(id: string) {
        try {
            return await prismaClient.users.findFirst({
                where: { id },
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
}
