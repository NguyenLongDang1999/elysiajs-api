// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { ISystemSettingsSearchDTO } from './system-settings.type'

// ** Utils Imports
import { REDIS_KEY } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { createRedisKey } from '@utils/index'

export class SystemSettingsClass {
    async getDataList(query: ISystemSettingsSearchDTO, redis: RedisClientType) {
        try {
            const systemSettingsCached = await redis.get(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, query.key))

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
                include: {
                    systemSettingOptions: true
                }
            })

            const systemSettings = systemSettingsData.map((systemItem) => ({
                ...systemItem,
                systemSettingOptions: undefined,
                setting_system_options: systemItem.systemSettingOptions.map((settingItem) => ({
                    id: settingItem.key,
                    name: settingItem.displayValue
                }))
            }))

            await redis.set(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, query.key), JSON.stringify(systemSettings))

            return systemSettings
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
