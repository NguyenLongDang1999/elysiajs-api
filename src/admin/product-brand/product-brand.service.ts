// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { REDIS_KEY } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import {
    createRedisKey,
    slugTimestamp
} from '@utils/index'

// ** Models Imports
import { productBrandModels } from './product-brand.model'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const productBrandTableList = new Elysia().use(productBrandModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductBrandWhereInput = {
                deleted_flg: false,
                name: {
                    contains: query.name || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: query.status || undefined
                },
                productCategoryBrand: {
                    some: {
                        product_category_id: {
                            equals: query.product_category_id || undefined
                        }
                    }
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.productBrand.findMany({
                    take,
                    skip,
                    orderBy: { created_at: 'desc' },
                    where: search,
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        image_uri: true,
                        created_at: true,
                        _count: {
                            select: {
                                product: {
                                    where: {
                                        deleted_flg: false
                                    }
                                }
                            }
                        },
                        productCategoryBrand: {
                            where: {
                                productCategory: { deleted_flg: false }
                            },
                            select: {
                                productCategory: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }),
                prismaClient.productBrand.count({
                    where: search
                })
            ])

            return {
                data: data.map((item) => {
                    return {
                        ...item,
                        productCategoryBrand: item.productCategoryBrand.map(
                            (categoryItem) => categoryItem.productCategory
                        )
                    }
                }),
                aggregations: count
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        query: 'productBrandSearch'
    }
)

export const productBrandDataListCategory = new Elysia()
    .use(redisPlugin)
    .get('data-list-category/:id', async ({ params, redis }) => {
        try {
            const productBrandCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_BRAND, params.id))

            if (productBrandCached) {
                return JSON.parse(productBrandCached)
            }

            const data = await prismaClient.productCategoryBrand.findMany({
                orderBy: {
                    productBrand: { created_at: 'desc' }
                },
                where: {
                    productBrand: { deleted_flg: false },
                    productCategory: { deleted_flg: false },
                    product_category_id: params.id
                },
                select: {
                    productBrand: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })

            const productBrand = data.map((_v) => _v.productBrand)

            await redis.set(createRedisKey(REDIS_KEY.PRODUCT_BRAND, params.id), JSON.stringify(productBrand))

            return productBrand
        } catch (error) {
            handleDatabaseError(error)
        }
    })

export const productBrandCreate = new Elysia()
    .use(redisPlugin)
    .use(productBrandModels)
    .post(
        '/',
        async ({ body, redis }) => {
            try {
                const { product_category_id, ...productBrandData } = body

                return await prismaClient.$transaction(async (prisma) => {
                    const productBrand = await prisma.productBrand.create({
                        data: {
                            ...productBrandData,
                            productCategoryBrand: {
                                createMany: {
                                    data: product_category_id.map((categoryItem) => ({
                                        product_category_id: categoryItem
                                    })),
                                    skipDuplicates: true
                                }
                            }
                        },
                        select: { id: true }
                    })

                    const deleteRedisKeys = product_category_id.map((category_id) =>
                        redis.del(createRedisKey(REDIS_KEY.PRODUCT_BRAND, category_id))
                    )

                    await Promise.all(deleteRedisKeys)

                    return productBrand
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productBrand'
        }
    )

export const productBrandUpdate = new Elysia()
    .use(redisPlugin)
    .use(productBrandModels)
    .patch(
        '/:id',
        async ({ body, params, redis }) => {
            try {
                const { product_category_id, ...productBrandData } = body

                return await prismaClient.$transaction(async (prisma) => {
                    const productBrand = await prisma.productBrand.update({
                        where: { id: params.id },
                        data: {
                            ...productBrandData,
                            productCategoryBrand: {
                                deleteMany: {},
                                createMany: {
                                    data: product_category_id.map((categoryItem) => ({
                                        product_category_id: categoryItem
                                    })),
                                    skipDuplicates: true
                                }
                            }
                        }
                    })

                    const deleteRedisKeys = product_category_id.map((category_id) =>
                        redis.del(createRedisKey(REDIS_KEY.PRODUCT_BRAND, category_id))
                    )

                    await Promise.all(deleteRedisKeys)
                    await redis.del(createRedisKey(REDIS_KEY.PRODUCT_BRAND, params.id))

                    return productBrand
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productBrand'
        }
    )

export const productBrandDelete = new Elysia()
    .use(redisPlugin)
    .use(productBrandModels)
    .delete(
        '/:id',
        async ({ query, params, redis }) => {
            try {
                if (query.force) {
                    await prismaClient.productBrand.delete({
                        where: { id: params.id },
                        select: {
                            id: true
                        }
                    })
                } else {
                    await prismaClient.productBrand.update({
                        data: {
                            deleted_flg: true,
                            slug: slugTimestamp(query.slug as string)
                        },
                        where: { id: params.id },
                        select: {
                            id: true
                        }
                    })
                }

                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_BRAND, params.id))

                return params.id
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            query: 'productBrandDelete'
        }
    )

export const productBrandRetrieve = new Elysia().use(redisPlugin).get('/:id', async ({ params, redis }) => {
    try {
        const productBrandCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_BRAND, params.id))

        if (productBrandCached) {
            return JSON.parse(productBrandCached)
        }

        const productBrandData = await prismaClient.productBrand.findFirst({
            where: {
                id: params.id,
                deleted_flg: false
            },
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                image_uri: true,
                description: true,
                productCategoryBrand: {
                    select: { product_category_id: true }
                }
            }
        })

        const productBrand = {
            ...productBrandData,
            product_category_id: productBrandData?.productCategoryBrand.map(
                ({ product_category_id }) => product_category_id
            ),
            productCategoryBrand: undefined
        }

        await redis.set(createRedisKey(REDIS_KEY.PRODUCT_BRAND, params.id), JSON.stringify(productBrand))

        return productBrand
    } catch (error) {
        handleDatabaseError(error)
    }
})
