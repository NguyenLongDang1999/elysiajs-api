// ** Elysia Imports
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'

// ** Router Imports
import { admin } from './admin'
import { user } from './user'

// ** Utils Imports
import { PAGE } from '@utils/enums'

const app = new Elysia({ prefix: '/api', normalize: true })
    .derive((ctx) => {
        const page = Number(ctx.query.page) || PAGE.CURRENT
        const pageSize = Number(ctx.query.pageSize) || PAGE.SIZE

        ctx.query.page = ((page - 1) * pageSize).toString()
        ctx.query.pageSize = pageSize.toString()
    })
    .onAfterHandle(({ request, set }) => {
        if (request.method !== 'OPTIONS') return

        const allowHeader = set.headers['Access-Control-Allow-Headers']

        if (allowHeader === '*') {
            set.headers['Access-Control-Allow-Headers'] = request.headers.get('Access-Control-Request-Headers') ?? ''
        }
    })
    .use(swagger())
    .use(
        cors({
            credentials: true,
            origin: [Bun.env.CMS_URL as string, Bun.env.USER_URL as string],
            allowedHeaders: ['Content-Type', 'Authorization']
        })
    )
    .use(admin)
    .use(user)
    .get('/', () => 'Hello Elysia')
    .listen(Bun.env.PORT || 3333)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
