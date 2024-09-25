// ** Elysia Imports
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'

// ** Libs Imports
import { RedisClient } from '@libs/ioredis'

// ** Router Imports
import { admin } from './admin'
import { user } from './user'

const app = new Elysia({ prefix: '/api', normalize: true })
    .derive((ctx) => {
        if (ctx.query.page && ctx.query.pageSize) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ctx.query.page = ((ctx.query.page - 1) * ctx.query.pageSize)
        }
    })
    .onAfterHandle(({ request, set }) => {
        if (request.method !== 'OPTIONS') return

        const allowHeader = set.headers['Access-Control-Allow-Headers']

        if (allowHeader === '*') {
            set.headers['Access-Control-Allow-Headers'] = request.headers.get('Access-Control-Request-Headers') ?? ''
        }
    })
    .decorate({
        redis: new RedisClient(Bun.env.REDIS_URL)
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
