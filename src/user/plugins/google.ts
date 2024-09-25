// ** Elysia Imports
import { Elysia } from 'elysia'
import { oauth2 } from 'elysia-oauth2'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

const fetchGoogleUserInfo = async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch user info from Google API')
    }

    return response.json()
}

const googleUserPlugin = (app: Elysia) =>
    app.use(
        oauth2({
            Google: [
                Bun.env.GOOGLE_CLIENT_ID as string,
                Bun.env.GOOGLE_CLIENT_SECRET as string,
                Bun.env.GOOGLE_CALLBACK_URL as string
            ]
        })
            .get('/google', async ({ oauth2 }) => {
                const authorizationUrl = await oauth2.createURL('Google', {
                    scopes: [
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/userinfo.email'
                    ]
                })

                authorizationUrl.searchParams.set('access_type', 'offline')
                authorizationUrl.searchParams.set('prompt', 'consent')

                return authorizationUrl.toString()
            })
            .get('/google/callback', async ({ oauth2, error, cookie }) => {
                try {
                    const token = await oauth2.authorize('Google')

                    const userInfo = await fetchGoogleUserInfo(token.accessToken)

                    await prismaClient.users.create({
                        data: {
                            name: userInfo.name,
                            email: userInfo.email,
                            email_verified: userInfo.email_verified,
                            image_uri: userInfo.picture,
                            userSocialAccounts: {
                                create: [
                                    {
                                        provider: 'Google',
                                        provider_id: userInfo.sub,
                                        access_token: token.accessToken,
                                        refresh_token: token.refreshToken
                                    }
                                ]
                            }
                        }
                    })

                    cookie.accessToken.set({
                        value: token.accessToken,
                        expires: token.accessTokenExpiresAt,
                        secure: Bun.env.NODE_ENV === 'production',
                        httpOnly: Bun.env.NODE_ENV === 'production',
                        sameSite: Bun.env.NODE_ENV === 'production'
                    })

                    return { message: 'success' }
                } catch (err) {
                    if (err instanceof Error) {
                        console.error('Failed to authorize Google:', err.message)
                    }

                    return error('Internal Server Error')
                }
            })
    )

export { googleUserPlugin }
