// ** Elysia Imports
import { Cookie } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IAuthJwt } from './auth.type'

// ** Utils Imports
import {
    HASH_PASSWORD,
    JWT
} from '@utils/enums'

export class AuthClass {
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

    async updateRefreshToken(userId: string, refreshToken: string, expireAt?: Date) {
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
    }
}
