// ** Elysia Imports
import { Cookie } from 'elysia'

// ** Third Party Imports
import fs from 'fs'
import handlebars from 'handlebars'
import nodemailer from 'nodemailer'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IAuthJwt } from './auth.type'

// ** Utils Imports
import {
    HASH_PASSWORD,
    JWT
} from '@utils/enums'

export class UserAuthClass {
    async setCookie(
        user_id: string,
        jwtAccessToken: IAuthJwt,
        jwtRefreshToken: IAuthJwt,
        cookie: Record<string, Cookie<any>>,
        expireAt?: Date
    ) {
        const accessTokenJWT = await jwtAccessToken.sign({ sub: user_id })

        cookie.accessToken.set({
            value: accessTokenJWT,
            maxAge: Number(JWT.ACCESS_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production'
        })

        const refreshTokenJWT = await jwtRefreshToken.sign({ sub: user_id })

        cookie.refreshToken.set({
            value: refreshTokenJWT,
            maxAge: Number(JWT.REFRESH_TOKEN_EXP),
            secure: Bun.env.NODE_ENV === 'production',
            httpOnly: Bun.env.NODE_ENV === 'production',
            sameSite: Bun.env.NODE_ENV === 'production'
        })

        await this.updateRefreshToken(user_id, refreshTokenJWT, expireAt)

        return {
            token: {
                accessToken: accessTokenJWT,
                refreshToken: refreshTokenJWT
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

        await prismaClient.users.update({
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

    compileEmailTemplate(templatePath: string, data: any): string {
        const templateSource = fs.readFileSync(templatePath, 'utf-8')
        const template = handlebars.compile(templateSource)

        return template(data)
    }

    async sendResetPasswordEmail(to: string, htmlContent: string) {
        const transporter = this.createEmailTransporter()

        await transporter.sendMail({
            from: `"Mydashop" <${Bun.env.NODEMAILER_AUTH_USER}>`,
            to,
            subject: 'Yêu cầu khôi phục mật khẩu',
            html: htmlContent
        })
    }

    createEmailTransporter() {
        return nodemailer.createTransport({
            host: Bun.env.NODEMAILER_HOST,
            port: Number(Bun.env.NODEMAILER_PORT),
            secure: Boolean(Bun.env.NODEMAILER_SECURE),
            auth: {
                user: Bun.env.NODEMAILER_AUTH_USER,
                pass: Bun.env.NODEMAILER_AUTH_PASSWORD
            }
        })
    }

    addHoursToDate(date: Date, hours: number): Date {
        const result = new Date(date)
        result.setHours(result.getHours() + hours)

        return result
    }

    addMinutesToDate(date: Date, minutes: number): Date {
        const result = new Date(date)
        result.setMinutes(result.getMinutes() + minutes)

        return result
    }
}
