// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { ISystemSettingsSearchDTO } from './system-settings.type'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import { EXPIRES_AT, INPUT_TYPE, REDIS_KEY } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class SystemSettingsService {
    async getDataList(query: ISystemSettingsSearchDTO, redis: RedisClientType) {
        try {
            const systemSettingsCached = await redis.get(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, query.key))

            if (systemSettingsCached) {
                return JSON.parse(systemSettingsCached)
            }

            const systemSettings = await prismaClient.systemSettings.findMany({
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

            await redis.set(
                createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, query.key),
                JSON.stringify(systemSettings),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return systemSettings
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async metadata(redis: RedisClientType) {
        try {
            const systemSettings = await this.getDataList({ key: 'system_' }, redis)

            const theme_colour = systemSettings.find((_s: { key: string }) => _s.key === 'system_theme_colour')

            if (!theme_colour) {
                await prismaClient.systemSettings.create({
                    data: {
                        key: 'system_theme_colour',
                        value: 'blue',
                        label: 'Màu chủ đạo của Website',
                        input_type: INPUT_TYPE.SELECT,
                        systemSettingOptions: {
                            create: {
                                key: 'blue',
                                displayValue: 'Blue'
                            }
                        }
                    },
                    select: {
                        id: true
                    }
                })
            }

            return {
                theme_colour: theme_colour.value,
                system: systemSettings
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
