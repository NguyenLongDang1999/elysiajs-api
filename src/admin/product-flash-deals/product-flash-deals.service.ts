// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import {
    IProductFlashDealsDTO,
    IProductFlashDealsSearchDTO,
    IProductFlashDealsUpdatePriceDTO
} from './product-flash-deals.type'

// ** Utils Imports
import { createRedisKey, slugTimestamp } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY, STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductFlashDealsService {
    async getTableList(query: IProductFlashDealsSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.FlashDealsWhereInput = {
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
                prismaClient.flashDeals.findMany({
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
                        start_time: true,
                        end_time: true,
                        flashDealProducts: {
                            where: {
                                productVariants: {
                                    deleted_flg: false,
                                    product: {
                                        deleted_flg: false
                                    }
                                }
                            },
                            select: {
                                productVariants: {
                                    select: {
                                        _count: true
                                    }
                                }
                            }
                        }
                    }
                }),
                prismaClient.flashDeals.count({
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
    }

    async create(data: IProductFlashDealsDTO, redis: RedisClientType) {
        try {
            const { product_variants, ...productFlashDealData } = data

            return await prismaClient.flashDeals.create({
                data: {
                    ...productFlashDealData,
                    flashDealProducts: {
                        create: product_variants?.map((productVariantItem) => ({
                            product_variants_id: productVariantItem.id,
                            price: productVariantItem.price,
                            special_price: productVariantItem.special_price,
                            special_price_type: Number(productVariantItem.special_price_type),
                            quantity_limit: productVariantItem.quantity_limit
                        }))
                    }
                },
                select: {
                    id: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: IProductFlashDealsDTO, redis: RedisClientType) {
        try {
            const { product_variants: _, ...productFlashDealData } = data

            return await prismaClient.flashDeals.update({
                where: { id },
                data: productFlashDealData,
                select: {
                    id: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async updateProductPrice(data: IProductFlashDealsUpdatePriceDTO, redis: RedisClientType) {
        try {
            return await prismaClient.flashDealProducts.update({
                where: {
                    flash_deal_id_product_variants_id: {
                        flash_deal_id: data.flash_deal_id,
                        product_variants_id: data.product_variants_id
                    }
                },
                data: {
                    price: data.price,
                    special_price: data.special_price,
                    special_price_type: data.special_price_type
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string, redis: RedisClientType) {
        try {
            const productFlashDeals = await prismaClient.flashDeals.findFirstOrThrow({
                where: {
                    id,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    start_time: true,
                    end_time: true,
                    description: true,
                    flashDealProducts: {
                        where: {
                            productVariants: {
                                deleted_flg: false,
                                product: {
                                    deleted_flg: false
                                }
                            }
                        },
                        select: {
                            price: true,
                            special_price: true,
                            special_price_type: true,
                            quantity_limit: true,
                            productVariants: {
                                select: {
                                    id: true,
                                    sku: true,
                                    label: true,
                                    product: {
                                        select: {
                                            id: true,
                                            name: true,
                                            image_uri: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            const product_id: string[] = []
            const productVariants = new Map()

            productFlashDeals.flashDealProducts.forEach((fp) => {
                const variant = fp.productVariants
                const product = variant.product

                if (!productVariants.has(product.id)) {
                    productVariants.set(product.id, {
                        ...product,
                        productVariants: []
                    })

                    product_id.push(product.id)
                }

                const productEntry = productVariants.get(product.id)

                productEntry.productVariants.push({
                    id: variant.id,
                    sku: variant.sku,
                    label: variant.label,
                    price: fp.price,
                    special_price: fp.special_price,
                    special_price_type: fp.special_price_type,
                    quantity_limit: fp.quantity_limit
                })
            })

            return {
                ...productFlashDeals,
                product_id,
                productVariants: Array.from(productVariants.values()),
                flashDealProducts: undefined
            }
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
                    title: true
                }
            })

            const productCollection = productCollectionData.map((_v) => ({
                id: _v.id,
                name: _v.title
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