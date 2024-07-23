// ** Elysia Imports
import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'

// ** Utils Imports
import { JWT } from '@src/utils/enums'

const jwtPlugin = (app: Elysia) =>
    app.use(
        jwt({
            name: JWT.JWT_NAME,
            secret: Bun.env.JWT_ACCESS_SECRET as string
        })
    )

export { jwtPlugin }
