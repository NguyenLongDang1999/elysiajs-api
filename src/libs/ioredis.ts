// ** Third Party Imports
import Redis from 'ioredis'

// ** Utils Imports
import { EXPIRES_AT } from '@utils/enums'

export class RedisClient {
    private redisClient: Redis
    private expiresAt = EXPIRES_AT.REDIS_EXPIRES_AT

    constructor(_connectionString?: string) {
        this.redisClient = _connectionString ? new Redis(_connectionString) : new Redis()

        this.redisClient.on('error', (error) => {
            console.error('[Redis] Error:', error)
        })

        this.redisClient.on('close', () => {
            console.error('[Redis] Connection closed.')
        })
    }

    async set(key: string, value: string) {
        return this.redisClient.set(key, value, 'EX', this.expiresAt)
    }

    async get(key: string) {
        return this.redisClient.get(key)
    }

    async del(key: string) {
        return this.redisClient.del(key)
    }

    async forgetAll() {
        return this.redisClient.flushall()
    }

    async sadd(key: string, value: any) {
        return this.redisClient.sadd(key, value)
    }

    async smembers(key: string) {
        return this.redisClient.smembers(key)
    }

    async srem(key: string, value: string) {
        return this.redisClient.srem(key, value)
    }
}

export type RedisClientType = InstanceType<typeof RedisClient>
