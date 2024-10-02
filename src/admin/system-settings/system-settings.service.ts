// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import { REDIS_KEY } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { systemSettingsModels } from './system-settings.model'

// ** Models Imports
import { SystemSettingsClass } from './system-settings.class'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const systemSettingDataList = new Elysia()
    .decorate({
        SystemSettingsClass: new SystemSettingsClass()
    })
    .use(redisPlugin)
    .use(systemSettingsModels)
    .get('/', async ({ SystemSettingsClass, redis, query }) => SystemSettingsClass.getDataList(query, redis), {
        query: 'systemSettingsSearch'
    })

export const systemSettingMetadata = new Elysia()
    .decorate({
        SystemSettingsClass: new SystemSettingsClass()
    })
    .use(redisPlugin)
    .get('/metadata', async ({ SystemSettingsClass, redis }) => {
        try {
            const systemSettings = await SystemSettingsClass.getDataList({ key: 'system_' }, redis)

            const theme_colour = systemSettings.find((_s: { key: string }) => _s.key === 'system_theme_colour')

            return {
                theme_colour: theme_colour.value,
                system: systemSettings
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    })

export const systemSettingCreate = new Elysia()
    .use(redisPlugin)
    .use(systemSettingsModels)
    .post(
        '/',
        async ({ body, redis }) => {
            try {
                const { setting_system_options, redis_key, ...systemSettingData } = body

                const systemSettings = await prismaClient.systemSettings.upsert({
                    where: {
                        key: body.key
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
                        value: body.value
                    }
                })

                await redis.del(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, redis_key))

                return systemSettings
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'systemSettings'
        }
    )

export const systemSettingUpdate = new Elysia()
    .use(redisPlugin)
    .use(systemSettingsModels)
    .patch(
        '/:id',
        async ({ params, body, redis }) => {
            try {
                const { setting_system_options, ...systemSettingData } = body

                return await prismaClient.$transaction(async (prisma) => {
                    const updatedSystemSettings = await prisma.systemSettings.update({
                        where: { id: params.id },
                        data: systemSettingData
                    })

                    const existingOptions = await prisma.systemSettingOptions.findMany({
                        where: { system_setting_id: params.id }
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
                                    system_setting_id: params.id
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

                    await redis.del(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, body.key))

                    return updatedSystemSettings
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'systemSettings'
        }
    )
