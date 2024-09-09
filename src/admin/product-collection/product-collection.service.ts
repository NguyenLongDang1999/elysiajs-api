// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductCollectionDTO, IProductCollectionSearchDTO } from './product-collection.type'

// ** Utils Imports
import { createRedisKey, slugTimestamp } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY, STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductCollectionService {
    async getTableList(query: IProductCollectionSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductCollectionWhereInput = {
                deleted_flg: false,
                title: {
                    contains: query.title || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: Number(query.status) || undefined
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
                        productCollectionProduct: {
                            where: {
                                product: {
                                    deleted_flg: false
                                }
                            },
                            select: {
                                product: {
                                    select: {
                                        _count: true
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
                data: data.map((item) => {
                    return {
                        ...item,
                        product: item.productCollectionProduct.map((_pcItem) => _pcItem.product)
                    }
                }),
                aggregations: count
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(data: IProductCollectionDTO, redis: RedisClientType) {
        try {
            const { product_id, ...productCollectionData } = data

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
    }

    async update(id: string, data: IProductCollectionDTO, redis: RedisClientType) {
        try {
            const { product_id, ...productCollectionData } = data

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
                    where: { id },
                    select: { id: true }
                })

                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'))
                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, id))

                return productCollection
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string, redis: RedisClientType) {
        try {
            const productCollectionCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, id))

            if (productCollectionCached) {
                return JSON.parse(productCollectionCached)
            }

            const productCollectionData = await prismaClient.productCollection.findFirstOrThrow({
                where: {
                    id,
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

            await redis.set(
                createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, id),
                JSON.stringify(productCollection),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return productCollection
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO, redis: RedisClientType) {
        try {
            if (query.force) {
                await prismaClient.productCollection.delete({
                    where: { id },
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
                    where: { id },
                    select: {
                        id: true
                    }
                })
            }

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'))
            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, id))

            return id
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getDataList(redis: RedisClientType) {
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

            await redis.set(
                createRedisKey(REDIS_KEY.PRODUCT_COLLECTION, 'list'),
                JSON.stringify(productCollection),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return productCollection
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
