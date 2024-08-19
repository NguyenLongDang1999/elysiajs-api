// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { ISystemSettingsSearchDTO } from './system-settings.type'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class SystemSettingsService {
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
                JSON.stringify(systemSettingsData),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return systemSettingsData
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async metadata(redis: RedisClientType) {
        try {
            const systemSettings = await this.getDataList({ key: 'system_' }, redis)

            const theme_colour = systemSettings.find((_s: { key: string }) => _s.key === 'system_theme_colour')

            return {
                theme_colour: theme_colour.value,
                system: systemSettings
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
