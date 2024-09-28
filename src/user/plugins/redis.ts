// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Libs Imports
import { RedisClient } from '@libs/ioredis'

const redisPlugin = (app: Elysia) =>
    app
        .decorate({
            redis: new RedisClient(Bun.env.REDIS_URL)
        })

export { redisPlugin }
