// ** Elysia Imports
import { jwt } from '@elysiajs/jwt'
import { Elysia, t } from 'elysia'

// ** Utils Imports
import { JWT } from '@utils/enums'

const jwtUserPlugin = (app: Elysia) =>
    app
        .use(
            jwt({
                name: JWT.ACCESS_TOKEN_NAME,
                schema: t.Object({
                    sub: t.String()
                }),
                exp: '1h',
                secret: Bun.env.JWT_ACCESS_SECRET as string
            })
        )
        .use(
            jwt({
                name: JWT.REFRESH_TOKEN_NAME,
                schema: t.Object({
                    sub: t.String()
                }),
                exp: '7 days',
                secret: Bun.env.JWT_REFRESH_SECRET as string
            })
        )

export { jwtUserPlugin }
