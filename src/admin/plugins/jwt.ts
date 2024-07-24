// ** Elysia Imports
import { jwt } from '@elysiajs/jwt'
import { Elysia, t } from 'elysia'

// ** Utils Imports
import { JWT } from '@src/utils/enums'

const jwtPlugin = (app: Elysia) =>
    app
        .use(
            jwt({
                name: JWT.ACCESS_TOKEN_NAME,
                schema: t.Object({
                    sub: t.String()
                }),
                secret: Bun.env.JWT_ACCESS_SECRET as string
            })
        )
        .use(
            jwt({
                name: JWT.REFRESH_TOKEN_NAME,
                schema: t.Object({
                    sub: t.String()
                }),
                secret: Bun.env.JWT_REFRESH_SECRET as string
            })
        )

export { jwtPlugin }
