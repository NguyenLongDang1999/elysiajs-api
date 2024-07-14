// ** Elysia Imports
import { error } from 'elysia'

// ** Database Imports
import { db } from '@src/database/drizzle'
import { adminsSchema } from '@src/database/drizzle/schema'

// ** Types Imports
import { IAuthSignInDTO } from './auth.type'

// ** Drizzle Imports
import { and, eq } from 'drizzle-orm'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

export class AuthService {
    async signIn(data: IAuthSignInDTO) {
        const user = await db.query.adminsSchema.findFirst({
            where: and(eq(adminsSchema.deleted_flg, false), eq(adminsSchema.email, data.email)),
            columns: {
                id: true,
                password: true,
            },
        })

        if (!user) throw error('Not Found')

        const passwordMatches = await Bun.password.verify(data.password, user.password, 'argon2id')

        if (!passwordMatches) throw error('Bad Request')

        return { id: user.id }
    }

    hashData(data: string) {
        return Bun.password.hash(data, {
            algorithm: 'argon2id',
        })
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        try {
            const hashedRefreshToken = await this.hashData(refreshToken)

            return await db
                .update(adminsSchema)
                .set({ refresh_token: hashedRefreshToken })
                .where(eq(adminsSchema.id, userId))
                .returning({ id: adminsSchema.id })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async refreshTokens(id: string, refreshToken: string) {
        try {
            const user = await db.query.adminsSchema.findFirst({
                where: and(eq(adminsSchema.deleted_flg, false), eq(adminsSchema.id, id)),
                columns: {
                    id: true,
                    refresh_token: true,
                },
            })

            if (!user || !user.refresh_token) throw error('Forbidden')

            const refreshTokenMatches = await Bun.password.verify(refreshToken, user.refresh_token, 'argon2id')

            if (!refreshTokenMatches) throw error('Forbidden')

            return { id: user.id }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async signOut(userId: string) {
        try {
            return await db
                .update(adminsSchema)
                .set({ refresh_token: null })
                .where(eq(adminsSchema.id, userId))
                .returning({ id: adminsSchema.id })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async profile(userId: string) {
        try {
            return await db.query.adminsSchema.findFirst({
                where: and(
                    eq(adminsSchema.deleted_flg, false),
                    eq(adminsSchema.id, userId),
                ),
                columns: {
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
