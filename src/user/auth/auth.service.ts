// ** Elysia Imports
import { error } from 'elysia'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'
import fs from 'fs'
import handlebars from 'handlebars'
import nodemailer from 'nodemailer'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IAuthChangePasswordDTO, IAuthResetPasswordDTO, IAuthResetPasswordTokenDTO, IAuthSignInDTO, IAuthSignUpDTO } from './auth.type'

// ** Utils Imports
import { HASH_PASSWORD } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class AuthService {
    private readonly PASSWORD_RESET_INTERVAL = 15

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

    async forgotPassword(forgotPasswordDto: IAuthChangePasswordDTO) {
        try {
            const user = await prismaClient.users.findUnique({
                where: {
                    deleted_flg: false,
                    email: forgotPasswordDto.email
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

            if (user.last_password_reset && this.addMinutesToDate(user.last_password_reset, this.PASSWORD_RESET_INTERVAL) > now) {
                throw error('Forbidden')
            }

            const token = createId()

            await prismaClient.passwordResetToken.create({
                data: {
                    user_id: user.id,
                    token,
                    expires_at: this.addHoursToDate(new Date(), 1)
                }
            })

            await prismaClient.users.update({
                where: { id: user.id },
                data: { last_password_reset: now }
            })

            const resetLink = `${Bun.env.USER_URL}/dat-lai-mat-khau?token=${token}`

            const emailContent = this.compileEmailTemplate('src/templates/reset-password.hbs', {
                name: user.name,
                resetLink
            })

            await this.sendResetPasswordEmail(forgotPasswordDto.email, emailContent)

            return { message: 'success' }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async resetPassword(query: IAuthResetPasswordTokenDTO, data: IAuthResetPasswordDTO) {
        try {
            const resetToken = await prismaClient.passwordResetToken.findFirst({
                where: { token: query.token },
                include: { users: true }
            })

            if (!resetToken || resetToken.expires_at < new Date()) {
                throw error('Bad Request')
            }

            const hashedPassword = await this.hashData(data.password)

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
    }

    private compileEmailTemplate(templatePath: string, data: any): string {
        const templateSource = fs.readFileSync(templatePath, 'utf-8')
        const template = handlebars.compile(templateSource)

        return template(data)
    }

    private async sendResetPasswordEmail(to: string, htmlContent: string) {
        const transporter = this.createEmailTransporter()

        await transporter.sendMail({
            from: `"Mydashop" <${Bun.env.NODEMAILER_AUTH_USER}>`,
            to,
            subject: 'Yêu cầu khôi phục mật khẩu',
            html: htmlContent
        })
    }

    private createEmailTransporter() {
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
