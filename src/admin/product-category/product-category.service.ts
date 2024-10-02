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
import { productCategoryModels } from './product-category.model'

// ** Class Imports
import { ProductCategoryClass } from './product-category.class'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const productCategoryTableList = new Elysia().use(productCategoryModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductCategoryWhereInput = {
                deleted_flg: false,
                name: {
                    contains: query.name || undefined,
                    mode: 'insensitive'
                },
                parent_id: {
                    equals: query.parent_id || undefined
                },
                status: {
                    equals: query.status || undefined
                },
                productCategoryBrand: query.product_brand_id
                    ? {
                        some: {
                            product_brand_id: { contains: query.product_brand_id }
                        }
                    }
                    : undefined
            }

            const [data, count] = await Promise.all([
                prismaClient.productCategory.findMany({
                    take,
                    skip,
                    orderBy: {
                        created_at: 'desc'
                    },
                    where: search,
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        image_uri: true,
                        created_at: true,
                        parentCategory: {
                            select: {
                                id: true,
                                name: true,
                                image_uri: true,
                                _count: {
                                    select: {
                                        product: {
                                            where: {
                                                deleted_flg: false
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                product: {
                                    where: {
                                        deleted_flg: false
                                    }
                                }
                            }
                        }
                    }
                }),
                prismaClient.productCategory.count({
                    where: search
                })
            ])

            return {
                data,
                aggregations: count
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        query: 'productCategorySearch'
    }
)

export const productCategoryDataList = new Elysia()
    .decorate({
        ProductCategoryClass: new ProductCategoryClass()
    })
    .use(redisPlugin)
    .use(productCategoryModels)
    .get('/data-list', async ({ ProductCategoryClass, redis }) => {
        try {
            const productCategoryCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))

            if (productCategoryCached) {
                return JSON.parse(productCategoryCached)
            }

            const categoryList = await prismaClient.productCategory.findMany({
                orderBy: { created_at: 'desc' },
                where: {
                    parent_id: null,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    name: true
                }
            })

            const categoryNested = []

            for (const category of categoryList) {
                const categories = await ProductCategoryClass.renderTree(category.id, 1)
                categoryNested.push(category, ...categories)
            }

            await redis.set(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'), JSON.stringify(categoryNested))

            return categoryNested
        } catch (error) {
            handleDatabaseError(error)
        }
    })

export const productCategoryRetrieve = new Elysia().use(redisPlugin).get('/:id', async ({ params, redis }) => {
    try {
        const productCategoryCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, params.id))

        if (productCategoryCached) {
            return JSON.parse(productCategoryCached)
        }

        const productCategory = await prismaClient.productCategory.findFirst({
            where: {
                id: params.id,
                deleted_flg: false
            },
            select: {
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

        await redis.set(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, params.id), JSON.stringify(productCategory))

        return productCategory
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const productCategoryCreate = new Elysia()
    .use(redisPlugin)
    .use(productCategoryModels)
    .post(
        '/',
        async ({ body, redis }) => {
            try {
                const productCategory = await prismaClient.productCategory.create({
                    data: body,
                    select: {
                        id: true
                    }
                })

                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))

                return productCategory
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productCategory'
        }
    )

export const productCategoryUpdate = new Elysia()
    .use(redisPlugin)
    .use(productCategoryModels)
    .patch(
        '/:id',
        async ({ body, params, redis }) => {
            try {
                const productCategory = await prismaClient.productCategory.update({
                    data: body,
                    where: { id: params.id },
                    select: {
                        id: true
                    }
                })

                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))
                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, params.id))

                return productCategory
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productCategory'
        }
    )

export const productCategoryDelete = new Elysia()
    .use(redisPlugin)
    .use(productCategoryModels)
    .delete(
        '/:id',
        async ({ query, params, redis }) => {
            try {
                if (query.force) {
                    await prismaClient.productCategory.delete({
                        where: { id: params.id },
                        select: {
                            id: true
                        }
                    })
                } else {
                    await prismaClient.productCategory.update({
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

                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))
                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, params.id))

                return params.id
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            query: 'productCategoryDelete'
        }
    )
