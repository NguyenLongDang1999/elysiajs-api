// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IAuthJwt } from './auth.type'

// ** Utils Imports
import {
    HASH_PASSWORD,
} from '@utils/enums'

export class AuthClass {
    async setCookie(
        user_id: string,
        jwtAccessToken: IAuthJwt,
        jwtRefreshToken: IAuthJwt,
        expireAt?: Date
    ) {
        const accessTokenJWT = await jwtAccessToken.sign({
            sub: user_id
        })

        const refreshTokenJWT = await jwtRefreshToken.sign({
            sub: user_id
        })

        await this.updateRefreshToken(user_id, refreshTokenJWT, expireAt)

        return {
            token: {
                accessToken: accessTokenJWT,
                refreshToken: refreshTokenJWT,
            }
        }
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
