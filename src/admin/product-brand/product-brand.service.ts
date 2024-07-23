// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductBrandDTO, IProductBrandSearchDTO } from './product-brand.type'

// ** Utils Imports
import { createRedisKey, slugTimestamp } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductBrandService {
    async getTableList(query: IProductBrandSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductBrandWhereInput = {
                deleted_flg: false,
                name: {
                    contains: query.name || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: Number(query.status) || undefined
                },
                productCategoryBrand: {
                    some: {
                        product_category_id: { equals: query.product_category_id || undefined }
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
                        product: {
                            where: { deleted_flg: false },
                            select: {
                                _count: true
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
    }

    async create(data: IProductBrandDTO, redis: RedisClientType) {
        try {
            const { product_category_id, ...productBrandData } = data

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
                );

                await Promise.all(deleteRedisKeys);

                return productBrand
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: IProductBrandDTO, redis: RedisClientType) {
        try {
            const { product_category_id, ...productBrandData } = data

            return await prismaClient.$transaction(async (prisma) => {
                const productBrand = await prisma.productBrand.update({
                    where: { id },
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
                );

                await Promise.all(deleteRedisKeys);
                await redis.del(createRedisKey(REDIS_KEY.PRODUCT_BRAND, id))

                return productBrand
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string, redis: RedisClientType) {
        try {
            const productBrandCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_BRAND, id))

            if (productBrandCached) {
                return JSON.parse(productBrandCached)
            }

            const productBrandData = await prismaClient.productBrand.findFirst({
                where: {
                    id,
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

            await redis.set(
                createRedisKey(REDIS_KEY.PRODUCT_BRAND, id),
                JSON.stringify(productBrand),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return productBrand
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO, redis: RedisClientType) {
        try {
            if (query.force) {
                await prismaClient.productBrand.delete({
                    where: { id },
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
                    where: { id },
                    select: {
                        id: true
                    }
                })
            }

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_BRAND, id))

            return id
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getDataListCategory(product_category_id: string, redis: RedisClientType) {
        try {
            const productBrandCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_BRAND, product_category_id))

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
                    product_category_id
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

            await redis.set(
                createRedisKey(REDIS_KEY.PRODUCT_BRAND, product_category_id),
                JSON.stringify(productBrand),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return productBrand
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
