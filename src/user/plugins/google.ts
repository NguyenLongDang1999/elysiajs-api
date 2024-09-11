// ** Elysia Imports
import { Elysia } from 'elysia'
import { oauth2 } from 'elysia-oauth2'

const googleUserPlugin = (app: Elysia) =>
    app
        .use(
            oauth2({
                Google: [
                    Bun.env.GOOGLE_CLIENT_ID as string,
                    Bun.env.GOOGLE_CLIENT_SECRET as string,
                    Bun.env.GOOGLE_CALLBACK_URL as string
                ]
            })
                .get('/google', async ({ oauth2, redirect }) => {
                    const authorizationUrl = await oauth2.createURL('Google', {
                        scopes: [
                            'https://www.googleapis.com/auth/userinfo.profile',
                            'https://www.googleapis.com/auth/userinfo.email'
                        ]
                    })

                    authorizationUrl.searchParams.set('access_type', 'offline')
                    authorizationUrl.searchParams.set('prompt', 'consent')

                    return redirect(authorizationUrl.toString())
                })
                .get(
                    '/google/callback',
                    async ({
                        oauth2,
                        cookie: { redirectUrl, userRefreshToken },
                        error,
                        redirect
                    }) => {
                        try {
                            const token = await oauth2.authorize('Google')

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
                                console.error(
                                    'Failed to authorize Google:',
                                    err.message
                                )
                            }

                            return error(500)
                        }
                    }
                )
        )

export { googleUserPlugin }
