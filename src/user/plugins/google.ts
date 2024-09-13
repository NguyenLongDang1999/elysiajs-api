// ** Elysia Imports
import { Elysia } from 'elysia'
import { oauth2 } from 'elysia-oauth2'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

const fetchGoogleUserInfo = async (accessToken: string) => {
    const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=phoneNumbers,photos,emailAddresses,names', {
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
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/user.phonenumbers.read'
                    ]
                })

                authorizationUrl.searchParams.set('access_type', 'offline')
                authorizationUrl.searchParams.set('prompt', 'consent')

                return authorizationUrl.toString()
            })
            .get('/google/callback', async ({ oauth2, cookie: { redirectUrl, userRefreshToken }, error, redirect }) => {
                try {
                    const token = await oauth2.authorize('Google')

                    const userInfo = await fetchGoogleUserInfo(token.accessToken)

                    await prismaClient.users.create({
                        data: {
                            name: userInfo.names[0].displayName,
                            email: userInfo.emailAddresses[0].value,
                            email_verified: userInfo.emailAddresses[0].metadata.verified,
                            image_uri: userInfo.photos[0].url

                        }
                    })

                    if (token.refreshToken) {
                        userRefreshToken.set({
                            value: token.refreshToken,
                            secure: true,
                            httpOnly: true,
                            sameSite: 'strict'
                        })
                    }

                    return redirect(redirectUrl.value || '/')
                } catch (err) {
                    if (err instanceof Error) {
                        console.error('Failed to authorize Google:', err.message)
                    }

                    return error(500)
                }
            })
    )

export { googleUserPlugin }
