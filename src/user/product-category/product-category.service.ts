// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY, STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { IProductCategoryNestedListDTO } from './product-category.type'

export class ProductCategoryService {
    async getNestedList(redis: RedisClientType) {
        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_PRODUCT_CATEGORY, 'nested-list')
            const cachedData = await redis.get(cachedKey)

            if (cachedData) {
                return JSON.parse(cachedData)
            }

            const categoryList = await prismaClient.productCategory.findMany({
                orderBy: { created_at: 'desc' },
                where: {
                    parent_id: null,
                    deleted_flg: false,
                    status: STATUS.ACTIVE
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image_uri: true,
                    parent_id: true
                }
            })

            const categoryNested = []

            for (const category of categoryList) {
                const children = await this.renderTree(category.id, 1)

                const categoryWithChildren = {
                    ...category,
                    children
                }

                categoryNested.push(categoryWithChildren)
            }

            await redis.set(
                cachedKey,
                JSON.stringify(categoryNested),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return categoryNested
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async renderTree(parentId: string, level: number) {
        const categories = await prismaClient.productCategory.findMany({
            where: {
                parent_id: parentId,
                deleted_flg: false,
                status: STATUS.ACTIVE
            },
            select: {
                id: true,
                name: true,
                slug: true,
                image_uri: true,
                parent_id: true
            }
        })

        const categoryNested: IProductCategoryNestedListDTO[] = []

        for (const category of categories) {
            const children = await this.renderTree(category.id, level + 1)

            const categoryWithChildren: IProductCategoryNestedListDTO = {
                ...category,
                children
            }

            categoryNested.push(categoryWithChildren)
        }

        return categoryNested
    }
}
