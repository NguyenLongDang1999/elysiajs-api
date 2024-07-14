// ** Elysia Imports
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'

// ** Router Imports
import { admin } from './admin'

const app = new Elysia({ prefix: '/api' })
    .onTransform(({ query }) => {
        if (query.page && query.pageSize) {
            (query as any).page = parseInt(query.page);
            (query as any).pageSize = parseInt(query.pageSize);
    
            (query as any).page = (((query as any).page - 1) * (query as any).pageSize) as number;
        }
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
            origin: [Bun.env.CMS_URL!, Bun.env.USER_URL!],
            allowedHeaders: ['Content-Type', 'Authorization']
        }),
    )
    .use(admin)
    .get('/', () => 'Hello Elysia')
    .listen(Bun.env.PORT || 3333)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
