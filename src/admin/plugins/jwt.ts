// ** Elysia Imports
import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

// ** Utils Imports
import { JWT } from '@src/utils/enums'

const jwtPlugin = (app: Elysia) =>
    app.use(
        jwt({
            name: JWT.JWT_NAME,
            secret: Bun.env.JWT_ACCESS_SECRET!
        })
    )

export { jwtPlugin }
