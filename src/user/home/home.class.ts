// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import {
    REDIS_KEY,
    STATUS
} from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { formatSellingPrice } from '@utils/format'

// ** Types Imports
import {
    IHomeProductCollectionDTO,
    IHomeProductFlashDealsDTO
} from './home.type'

export class HomeClass {
    async getProductFlashDeals(
        product_flash_deals: IHomeProductFlashDealsDTO,
        redis: RedisClientType,
        user_id?: string
    ) {
        if (!product_flash_deals) return

        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_HOME_FLASH_DEALS, product_flash_deals.flash_deals_id)
            const cachedData = await redis.get(cachedKey)

            let productFlashDeals

            if (cachedData) {
                productFlashDeals = JSON.parse(cachedData)
            } else {
                productFlashDeals = await prismaClient.flashDeals.findFirst({
                    where: {
                        id: product_flash_deals.flash_deals_id,
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
                        title: true,
                        slug: true,
                        end_time: true,
                        discounted_price: true,
                        discounted_price_type: true,
                        flashDealProducts: {
                            where: {
                                product: {
                                    deleted_flg: false,
                                    status: STATUS.ACTIVE,
                                    productCategory: {
                                        deleted_flg: false,
                                        status: STATUS.ACTIVE
                                    }
                                }
                            },
                            select: {
                                product: {
                                    select: {
                                        id: true,
                                        slug: true,
                                        name: true,
                                        image_uri: true,
                                        price: true,
                                        special_price: true,
                                        special_price_type: true,
                                        total_rating: true,
                                        product_type: true,
                                        productCategory: {
                                            select: {
                                                id: true,
                                                slug: true,
                                                name: true
                                            }
                                        },
                                        productVariants: {
                                            where: {
                                                deleted_flg: false
                                            },
                                            select: {
                                                id: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                if (productFlashDeals) {
                    await redis.set(cachedKey, JSON.stringify(productFlashDeals))
                }
            }

            const formattedProduct = []

            let wishlistProductIds: Set<string> = new Set()
            let wishlistItems: string[] = []

            if (user_id) {
                wishlistItems = await redis.smembers(createRedisKey(REDIS_KEY.USER_WISHLIST, user_id))

                if (!wishlistItems || wishlistItems.length === 0) {
                    const productWishlist = await prismaClient.wishlist.findMany({
                        where: { user_id },
                        select: { product_id: true }
                    })

                    wishlistItems = productWishlist.map((_product) => _product.product_id)

                    if (wishlistItems.length > 0) {
                        await redis.sadd(createRedisKey(REDIS_KEY.USER_WISHLIST, user_id), wishlistItems)
                    }
                }

                wishlistProductIds = new Set(wishlistItems)
            }

            for (const _product of productFlashDeals?.flashDealProducts || []) {
                const isWishlist = wishlistProductIds ? wishlistProductIds.has(_product.product.id) : false

                const productPrice = {
                    price: Number(_product.product.price),
                    special_price: Number(_product.product.special_price),
                    special_price_type: Number(_product.product.special_price_type),
                    hasDiscount: true,
                    discounted_price: Number(productFlashDeals.discounted_price),
                    discounted_price_type: Number(productFlashDeals.discounted_price_type)
                }

                formattedProduct.push({
                    ..._product.product,
                    ...productPrice,
                    selling_price: formatSellingPrice(productPrice),
                    isWishlist,
                    flashDeal: {
                        title: productFlashDeals.title,
                        discounted_price: productFlashDeals.discounted_price,
                        discounted_price_type: productFlashDeals.discounted_price_type
                    },
                    product_variant_id: _product.product.productVariants
                        ? _product.product.productVariants[0].id
                        : undefined,
                    productPrice: {
                        price: _product.product.price,
                        special_price: _product.product.special_price,
                        special_price_type: _product.product.special_price_type
                    },
                    productVariants: undefined,
                    flashDealProducts: undefined
                })
            }

            return {
                ...productFlashDeals,
                flashDealProducts: formattedProduct
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getProductCategoryPopular(product_category_popular: string[], redis: RedisClientType) {
        if (!product_category_popular) return

        try {
            const cachedKey = createRedisKey(
                REDIS_KEY.USER_HOME_PRODUCT_CATEGORY_POPULAR,
                product_category_popular.join(', ')
            )
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

            await redis.set(cachedKey, JSON.stringify(productCategory))

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getProductCollection(
        product_collection: IHomeProductCollectionDTO,
        redis: RedisClientType,
        user_id?: string
    ) {
        if (!product_collection) return

        try {
            const productCollectionData = await Promise.all(
                product_collection.product_collection.map(async (_pc) => {
                    const cachedKey = createRedisKey(REDIS_KEY.USER_HOME_PRODUCT_COLLECTION, _pc.product_collection_id)
                    const cachedData = await redis.get(cachedKey)

                    if (cachedData) {
                        return JSON.parse(cachedData)
                    }

                    const result = await prismaClient.productCollection.findUnique({
                        where: {
                            id: _pc.product_collection_id,
                            deleted_flg: false,
                            status: STATUS.ACTIVE
                        },
                        select: {
                            id: true,
                            title: true,
                            productCollectionProduct: {
                                where: {
                                    product: {
                                        id: {
                                            in: _pc.product_id
                                        },
                                        deleted_flg: false,
                                        status: STATUS.ACTIVE,
                                        productCategory: {
                                            deleted_flg: false,
                                            status: STATUS.ACTIVE
                                        }
                                    }
                                },
                                select: {
                                    product: {
                                        select: {
                                            id: true,
                                            slug: true,
                                            name: true,
                                            image_uri: true,
                                            price: true,
                                            special_price: true,
                                            special_price_type: true,
                                            total_rating: true,
                                            product_type: true,
                                            productCategory: {
                                                select: {
                                                    id: true,
                                                    slug: true,
                                                    name: true
                                                }
                                            },
                                            productVariants: {
                                                where: {
                                                    deleted_flg: false
                                                },
                                                select: {
                                                    id: true
                                                }
                                            },
                                            flashDealProducts: {
                                                where: {
                                                    flashDeal: {
                                                        status: STATUS.ACTIVE,
                                                        start_time: {
                                                            lte: new Date()
                                                        },
                                                        end_time: {
                                                            gte: new Date()
                                                        }
                                                    }
                                                },
                                                select: {
                                                    flashDeal: {
                                                        select: {
                                                            id: true,
                                                            title: true,
                                                            discounted_price: true,
                                                            discounted_price_type: true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })

                    await redis.set(cachedKey, JSON.stringify(result))

                    return result
                })
            )

            return await Promise.all(
                productCollectionData.map(async (_pcd) => {
                    let wishlistProductIds: Set<string> = new Set()
                    let wishlistItems: string[] = []

                    if (user_id) {
                        wishlistItems = await redis.smembers(createRedisKey(REDIS_KEY.USER_WISHLIST, user_id))

                        if (!wishlistItems || wishlistItems.length === 0) {
                            const productWishlist = await prismaClient.wishlist.findMany({
                                where: { user_id },
                                select: { product_id: true }
                            })

                            wishlistItems = productWishlist.map((_product) => _product.product_id)

                            if (wishlistItems.length > 0) {
                                await redis.sadd(createRedisKey(REDIS_KEY.USER_WISHLIST, user_id), wishlistItems)
                            }
                        }

                        wishlistProductIds = new Set(wishlistItems)
                    }

                    return {
                        ..._pcd,
                        product: await Promise.all(
                            _pcd.productCollectionProduct.map(async (_p: any) => {
                                const isWishlist = wishlistProductIds ? wishlistProductIds.has(_p.product.id) : false
                                const flashDeals = _p.product.flashDealProducts[0]
                                    ? _p.product.flashDealProducts[0].flashDeal
                                    : undefined

                                const productPrice = {
                                    price: Number(_p.product.price),
                                    special_price: Number(_p.product.special_price),
                                    special_price_type: Number(_p.product.special_price_type),
                                    hasDiscount: !!flashDeals,
                                    discounted_price: !!flashDeals ? Number(flashDeals.discounted_price) : 0,
                                    discounted_price_type: !!flashDeals ? Number(flashDeals.discounted_price_type) : 0
                                }

                                return {
                                    ..._p.product,
                                    ...productPrice,
                                    selling_price: formatSellingPrice(productPrice),
                                    isWishlist,
                                    flashDeal: flashDeals,
                                    product_variant_id: _p.product.productVariants
                                        ? _p.product.productVariants[0].id
                                        : undefined,
                                    productVariants: undefined,
                                    flashDealProducts: undefined
                                }
                            })
                        )
                    }
                })
            )
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
