// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { EXPIRES_AT, REDIS_KEY, STATUS } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { createRedisKey } from '@utils/index'

// ** Service Imports
import { SystemSettingsService } from '../system-settings/system-settings.service'

export class HomeService {
    async data(SystemSettingsService: SystemSettingsService, redis: RedisClientType) {
        try {
            const systemSettings = await SystemSettingsService.getDataList({ key: 'home_' }, redis)

            const homeSystem = (key: string) => systemSettings.find((system: { key: string | string[] }) => system.key.includes(key))

            const getParseValueWithKey = (key: string) => {
                const system = homeSystem(key)

                return system && system.key === key ? JSON.parse(system.value) : []
            }

            const slider = getParseValueWithKey('home_slider')
            const product_category_popular = getParseValueWithKey('home_product_categories_popular')

            const productCategoryData = await this.getProductCategoryPopular(product_category_popular, redis)

            return {
                slider,
                // product_flash_deals: flashDealData,
                // product_collection: productCollectionData,
                product_categories_popular: productCategoryData
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getProductCategoryPopular(product_category_popular: string[], redis: RedisClientType) {
        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_HOME_PRODUCT_CATEGORY_POPULAR, product_category_popular.join(', '))
            const cachedData = await redis.get(cachedKey)

            if (cachedData) {
                return JSON.parse(cachedData)
            }

            const productCategory = await prismaClient.productCategory.findMany({
                where: {
                    id: { in: product_category_popular },
                    deleted_flg: false,
                    status: STATUS.ACTIVE
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image_uri: true
                }
            })

            await redis.set(
                cachedKey,
                JSON.stringify(productCategory),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
