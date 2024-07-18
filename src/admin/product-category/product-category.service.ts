// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Database Imports
import { productCategorySchema } from '@db/schema/product-category'
import { db } from '@src/database/drizzle'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductCategoryDTO, IProductCategorySearchDTO } from './product-category.type'

// ** Drizzle Imports
import { and, count, desc, eq, ilike, isNull, SQL } from 'drizzle-orm'

// ** Utils Imports
import { createRedisKey, slugTimestamp } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductCategoryService {
    async getTableList(query: IProductCategorySearchDTO) {
        try {
            const where: SQL[] = [eq(productCategorySchema.deleted_flg, false)]

            if (query.name) {
                where.push(ilike(productCategorySchema.name, `%${query.name}%`))
            }

            if (query.parent_id) {
                where.push(eq(productCategorySchema.parent_id, query.parent_id))
            }

            if (query.status) {
                where.push(eq(productCategorySchema.status, Number(query.status)))
            }

            const [data, [aggregations]] = await Promise.all([
                db.query.productCategorySchema.findMany({
                    offset: query.page,
                    limit: query.pageSize,
                    orderBy: (productCategory, { desc }) => [desc(productCategory.created_at)],
                    where: and(...where),
                    columns: {
                        id: true,
                        name: true,
                        status: true,
                        image_uri: true,
                        created_at: true
                    },
                    with: {
                        product: {
                            where: (product, { eq }) => eq(product.deleted_flg, false),
                            columns: {
                                id: true
                            }
                        },
                        parentCategory: {
                            with: {
                                product: {
                                    where: (product, { eq }) => eq(product.deleted_flg, false),
                                    columns: {
                                        id: true
                                    }
                                }
                            },
                            columns: {
                                id: true,
                                name: true,
                                image_uri: true
                            }
                        }
                    }
                }),
                db
                    .select({
                        value: count(productCategorySchema.id)
                    })
                    .from(productCategorySchema)
                    .where(and(...where))
            ])

            return {
                data,
                aggregations: aggregations.value
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(data: IProductCategoryDTO, redis: RedisClientType) {
        try {
            const productCategory = await db.insert(productCategorySchema).values(data).returning({
                id: productCategorySchema.id
            })

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: IProductCategoryDTO, redis: RedisClientType) {
        try {
            const productCategory = await db
                .update(productCategorySchema)
                .set(data)
                .where(eq(productCategorySchema.id, id))
                .returning({
                    id: productCategorySchema.id
                })

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))
            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, id))

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string, redis: RedisClientType) {
        try {
            const productCategoryCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, id))

            if (productCategoryCached) {
                return JSON.parse(productCategoryCached)
            }

            const productCategory = await db.query.productCategorySchema.findFirst({
                where: and(eq(productCategorySchema.id, id), eq(productCategorySchema.deleted_flg, false)),
                columns: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    parent_id: true,
                    image_uri: true,
                    description: true,
                    meta_title: true,
                    meta_description: true
                }
            })

            await redis.set(
                createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'),
                JSON.stringify(productCategory),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO, redis: RedisClientType) {
        try {
            if (query.force) {
                await db.delete(productCategorySchema).where(eq(productCategorySchema.id, id))
            } else {
                await db
                    .update(productCategorySchema)
                    .set({
                        deleted_flg: false,
                        slug: slugTimestamp(query.slug!)
                    })
                    .where(eq(productCategorySchema.id, id))
                    .returning({
                        id: productCategorySchema.id
                    })
            }

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))
            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, id))

            return id
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getDataList(redis: RedisClientType) {
        try {
            const productCategoryCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))

            if (productCategoryCached) {
                return JSON.parse(productCategoryCached)
            }

            const categoryList = await db.query.productCategorySchema.findMany({
                orderBy: desc(productCategorySchema.created_at),
                where: (_productCategory, { and }) =>
                    and(eq(productCategorySchema.deleted_flg, false), isNull(productCategorySchema.parent_id)),
                columns: {
                    id: true,
                    name: true
                }
            })

            const categoryNested = []

            for (const category of categoryList) {
                const categories = await this.renderTree(category.id, 1)
                categoryNested.push(category, ...categories)
            }

            await redis.set(
                createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'),
                JSON.stringify(categoryNested),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return categoryNested
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async renderTree(parent_id: string, level: number) {
        const categories = await db.query.productCategorySchema.findMany({
            where: (_productCategory, { and }) =>
                and(eq(productCategorySchema.deleted_flg, false), eq(productCategorySchema.parent_id, parent_id)),
            columns: {
                id: true,
                name: true
            }
        })

        const customLevelName = '|--- '.repeat(level)

        let categoryNested: {
            id: string
            name: string
        }[] = []

        for (const category of categories) {
            const name = customLevelName + category.name
            categoryNested.push({ ...category, name: name })

            const children = await this.renderTree(category.id, level + 1)
            categoryNested = [...categoryNested, ...children]
        }

        return categoryNested
    }
}
