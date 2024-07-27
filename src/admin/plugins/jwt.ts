// ** Elysia Imports
import { jwt } from '@elysiajs/jwt'
import { Elysia, t } from 'elysia'

// ** Utils Imports
import { getExpTimestamp } from '@src/utils'
import { JWT } from '@src/utils/enums'

const jwtPlugin = (app: Elysia) =>
    app
        .use(
            jwt({
                name: JWT.ACCESS_TOKEN_NAME,
                schema: t.Object({
                    sub: t.String()
                }),
                exp: getExpTimestamp(JWT.ACCESS_TOKEN_EXP),
                secret: Bun.env.JWT_ACCESS_SECRET as string
            })
        )
        .use(
            jwt({
                name: JWT.REFRESH_TOKEN_NAME,
                schema: t.Object({
                    sub: t.String()
                }),
                exp: getExpTimestamp(JWT.REFRESH_TOKEN_EXP),
                secret: Bun.env.JWT_REFRESH_SECRET as string
            })
        )

export { jwtPlugin }
