// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { ISystemSettingsDTO, ISystemSettingsSearchDTO } from './system-settings.type'

// ** Utils Imports
import { createRedisKey } from '@utils/index'
import { REDIS_KEY } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class SystemSettingsService {
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

            await redis.set(
                createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, query.key),
                JSON.stringify(systemSettings)
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

            return {
                theme_colour: theme_colour.value,
                system: systemSettings
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(data: ISystemSettingsDTO, redis: RedisClientType) {
        try {
            const { setting_system_options, redis_key, ...systemSettingData } = data

            const systemSettings = await prismaClient.systemSettings.upsert({
                where: {
                    key: data.key
                },
                create: {
                    ...systemSettingData,
                    systemSettingOptions: {
                        create:
                            setting_system_options &&
                            setting_system_options.map((settingItem) => ({
                                key: settingItem.id,
                                displayValue: settingItem.name
                            }))
                    }
                },
                update: {
                    value: data.value
                }
            })

            await redis.del(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, redis_key))

            return systemSettings
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: ISystemSettingsDTO, redis: RedisClientType) {
        try {
            const { setting_system_options, ...systemSettingData } = data

            return await prismaClient.$transaction(async (prisma) => {
                const updatedSystemSettings = await prisma.systemSettings.update({
                    where: { id },
                    data: systemSettingData
                })

                const existingOptions = await prisma.systemSettingOptions.findMany({
                    where: { system_setting_id: id }
                })

                const existingOptionsMap = new Map(existingOptions.map((option) => [option.key, option]))

                for (const option of setting_system_options || []) {
                    const existingOption = existingOptionsMap.get(option.id)

                    if (existingOption) {
                        await prisma.systemSettingOptions.update({
                            where: { id: existingOption.id },
                            data: { displayValue: option.name }
                        })
                        existingOptionsMap.delete(option.id)
                    } else {
                        await prisma.systemSettingOptions.create({
                            data: {
                                key: option.id,
                                displayValue: option.name,
                                system_setting_id: id
                            }
                        })
                    }
                }

                if (existingOptionsMap.size > 0) {
                    await prisma.systemSettingOptions.deleteMany({
                        where: {
                            id: {
                                in: Array.from(existingOptionsMap.values()).map((option) => option.id)
                            }
                        }
                    })
                }

                await redis.del(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, data.key))

                return updatedSystemSettings
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
