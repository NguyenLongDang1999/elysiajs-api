// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { ISystemSettingsSearchDTO } from './system-settings.type'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import { REDIS_KEY } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class UserSystemSettingsClass {
    async getDataList(query: ISystemSettingsSearchDTO, redis: RedisClientType) {
        try {
            const systemSettingsCached = await redis.get(createRedisKey(REDIS_KEY.USER_SYSTEM_SETTINGS, query.key))

            if (systemSettingsCached) {
                return JSON.parse(systemSettingsCached)
            }

            const systemSettingsData = await prismaClient.systemSettings.findMany({
                orderBy: { created_at: 'desc' },
                where: {
                    deleted_flg: false,
                    key: {
                        startsWith: query.key
                    }
                },
                select: {
                    key: true,
                    value: true
                }
            })

            await redis.set(
                createRedisKey(REDIS_KEY.USER_SYSTEM_SETTINGS, query.key),
                JSON.stringify(systemSettingsData)
            )

            return systemSettingsData
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
