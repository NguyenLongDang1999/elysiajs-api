// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { ISystemSettingsSearchDTO } from './system-settings.type'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import { REDIS_KEY, STATUS } from '@utils/enums'
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

    async getMenuFlashDeals(redis: RedisClientType) {
        try {
            const menuFlashDealsCached = await redis.get(createRedisKey(REDIS_KEY.USER_MENU_FLASH_DEALS))

            if (menuFlashDealsCached) {
                return JSON.parse(menuFlashDealsCached)
            }

            const menuFlashDeals = await prismaClient.flashDeals.findMany({
                where: {
                    deleted_flg: false,
                    status: STATUS.ACTIVE,
                    start_time: {
                        lte: new Date()
                    },
                    end_time: {
                        gte: new Date()
                    }
                },
                select: {
                    id: true,
                    title: true,
                    slug: true
                }
            })

            await redis.set(
                createRedisKey(REDIS_KEY.USER_MENU_FLASH_DEALS),
                JSON.stringify(menuFlashDeals)
            )

            return menuFlashDeals
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getMenuCollections(redis: RedisClientType) {
        try {
            const menuCollectionsCached = await redis.get(createRedisKey(REDIS_KEY.USER_MENU_COLLECTIONS))

            if (menuCollectionsCached) {
                return JSON.parse(menuCollectionsCached)
            }

            const menuCollections = await prismaClient.productCollection.findMany({
                where: {
                    deleted_flg: false,
                    status: STATUS.ACTIVE
                },
                select: {
                    id: true,
                    title: true,
                    slug: true
                }
            })

            await redis.set(
                createRedisKey(REDIS_KEY.USER_MENU_COLLECTIONS),
                JSON.stringify(menuCollections)
            )

            return menuCollections
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
