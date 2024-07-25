// ** Elysia Imports
import { error } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IAuthSignInDTO } from './auth.type'

// ** Utils Imports
import { HASH_PASSWORD } from '@src/utils/enums'
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

    async signIn(data: IAuthSignInDTO) {
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

        return { id: user.id }
    }

    hashData(data: string) {
        return Bun.password.hash(data, {
            algorithm: HASH_PASSWORD.ALGORITHM
        })
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        try {
            const hashedRefreshToken = await this.hashData(refreshToken)

            await prismaClient.admins.update({
                where: { id: userId },
                data: { refresh_token: hashedRefreshToken },
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
                    refresh_token: true
                }
            })

            if (!user || !user.refresh_token) throw error('Forbidden')

            const refreshTokenMatches = await Bun.password.verify(
                refreshToken,
                user.refresh_token,
                HASH_PASSWORD.ALGORITHM
            )

            if (!refreshTokenMatches) throw error('Forbidden')

            return { id: user.id }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async signOut(userId: string) {
        try {
            return await prismaClient.admins.update({
                where: { id: userId },
                data: { refresh_token: null },
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
            return await prismaClient.admins.findFirst({
                where: { id },
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
