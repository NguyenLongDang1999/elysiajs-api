// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import {
    createRedisKey,
    slugTimestamp
} from '@src/utils'
import {
    REDIS_KEY,
    STATUS
} from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { productCollectionModels } from './product-collection.model'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const productCollectionTableList = new Elysia().use(productCollectionModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductCollectionWhereInput = {
                deleted_flg: false,
                title: {
                    contains: query.title || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: query.status || undefined
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.productCollection.findMany({
                    take,
                    skip,
                    orderBy: {
                        created_at: 'desc'
                    },
                    where: search,
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        created_at: true,
                        _count: {
                            select: {
                                productCollectionProduct: {
                                    where: {
                                        product: {
                                            deleted_flg: false
                                        }
                                    }
                                }
                            }
                        }
                    }
                }),
                prismaClient.productCollection.count({
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
        query: 'productCollectionSearch'
    }
)

export const productCollectionRetrieve = new Elysia().use(redisPlugin).get('/:id', async ({ params, redis }) => {
    try {
        const productCollectionCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, params.id))

        if (productCollectionCached) {
            return JSON.parse(productCollectionCached)
        }

        const productCollectionData = await prismaClient.productCollection.findFirstOrThrow({
            where: {
                id: params.id,
                deleted_flg: false
            },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                productCollectionProduct: {
                    where: {
                        product: {
                            deleted_flg: false
                        }
                    },
                    select: {
                        product: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        })

        const productCollection = {
            ...productCollectionData,
            productCollectionProduct: undefined,
            product_id: productCollectionData.productCollectionProduct.map((_pc) => _pc.product.id)
        }

        await redis.set(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, params.id), JSON.stringify(productCollection))

        return productCollection
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const productCollectionDataList = new Elysia().use(redisPlugin).get('/data-list', async ({ redis }) => {
    try {
        const productCollectionCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'))

        if (productCollectionCached) {
            return JSON.parse(productCollectionCached)
        }

        const productCollectionData = await prismaClient.productCollection.findMany({
            orderBy: { created_at: 'desc' },
            where: {
                deleted_flg: false,
                status: STATUS.ACTIVE
            },
            select: {
                id: true,
                title: true,
                productCollectionProduct: {
                    where: {
                        product: {
                            deleted_flg: false,
                            status: STATUS.ACTIVE
                        }
                    },
                    select: {
                        product_id: true
                    }
                }
            }
        })

        const productCollection = productCollectionData.map((_v) => ({
            id: _v.id,
            name: _v.title,
            product_id: _v.productCollectionProduct.map((_collection) => _collection.product_id)
        }))

        await redis.set(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'), JSON.stringify(productCollection))

        return productCollection
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const productCollectionCreate = new Elysia()
    .use(redisPlugin)
    .use(productCollectionModels)
    .post(
        '/',
        async ({ body, redis }) => {
            try {
                const { product_id, ...productCollectionData } = body

                return await prismaClient.$transaction(async (prisma) => {
                    const productCollection = await prisma.productCollection.create({
                        data: {
                            ...productCollectionData,
                            productCollectionProduct: {
                                createMany: {
                                    data: product_id.map((productItem) => ({
                                        product_id: productItem
                                    })),
                                    skipDuplicates: true
                                }
                            }
                        },
                        select: {
                            id: true
                        }
                    })

                    await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'))

                    return productCollection
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productCollection'
        }
    )

export const productCollectionUpdate = new Elysia()
    .use(redisPlugin)
    .use(productCollectionModels)
    .patch(
        '/:id',
        async ({ body, params, redis }) => {
            try {
                const { product_id, ...productCollectionData } = body

                return await prismaClient.$transaction(async (prisma) => {
                    const productCollection = await prisma.productCollection.update({
                        data: {
                            ...productCollectionData,
                            productCollectionProduct: {
                                deleteMany: {},
                                createMany: {
                                    data: product_id.map((productItem) => ({
                                        product_id: productItem
                                    })),
                                    skipDuplicates: true
                                }
                            }
                        },
                        where: { id: params.id },
                        select: { id: true }
                    })

                    await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'))
                    await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, params.id))

                    return productCollection
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productCollection'
        }
    )

export const productCollectionDelete = new Elysia()
    .use(redisPlugin)
    .use(productCollectionModels)
    .delete(
        '/:id',
        async ({ query, params, redis }) => {
            try {
                if (query.force) {
                    await prismaClient.productCollection.delete({
                        where: { id: params.id },
                        select: {
                            id: true
                        }
                    })
                } else {
                    await prismaClient.productCollection.update({
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

                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'))
                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, params.id))

                return params.id
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            query: 'productCollectionDelete'
        }
    )
