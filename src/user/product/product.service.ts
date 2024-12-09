// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import {
    createRedisKey,
    flattenCategories,
    getBreadcrumbs
} from '@src/utils'
import {
    REDIS_KEY,
    STATUS
} from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import {
    formatSellingPrice,
    type ProductPrice
} from '@utils/format'

// ** Class Imports
import { UserProductCategoryClass } from '../product-category/product-category.class'

// ** Models Imports
import { ProductModels } from './product.model'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'
import { authUserPlugin } from '../plugins/auth'

// ** Types Imports
import { IProductAttribute } from '../home/home.type'
import { IProductCategoryNestedListDTO } from '../product-category/product-category.type'

export const productRetrieve = new Elysia()
    .decorate({
        UserProductCategoryClass: new UserProductCategoryClass()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .get('/:slug', async ({ UserProductCategoryClass, params, redis, user }) => {
        try {
            const product = await prismaClient.product.findFirstOrThrow({
                where: {
                    slug: params.slug,
                    deleted_flg: false,
                    status: STATUS.ACTIVE,
                    productCategory: {
                        deleted_flg: false,
                        status: STATUS.ACTIVE
                    }
                },
                select: {
                    id: true,
                    sku: true,
                    name: true,
                    slug: true,
                    image_uri: true,
                    technical_specifications: true,
                    short_description: true,
                    description: true,
                    meta_title: true,
                    meta_description: true,
                    total_rating: true,
                    review_count: true,
                    productImages: {
                        orderBy: { index: 'asc' },
                        select: { image_uri: true }
                    },
                    productCategory: {
                        select: {
                            id: true,
                            slug: true,
                            name: true
                        }
                    },
                    productBrand: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    flashDealProducts: {
                        where: {
                            flashDeal: {
                                deleted_flg: false,
                                status: STATUS.ACTIVE,
                                start_time: {
                                    lte: new Date()
                                },
                                end_time: {
                                    gte: new Date()
                                }
                            },
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
                            flashDeal: {
                                select: {
                                    id: true,
                                    title: true,
                                    discounted_price: true,
                                    discounted_price_type: true
                                }
                            }
                        }
                    },
                    productVariants: {
                        select: {
                            id: true,
                            productPrices: {
                                select: {
                                    price: true,
                                    special_price: true,
                                    special_price_type: true
                                }
                            },
                            productVariantAttributeValues: {
                                where: {
                                    productAttributeValues: {
                                        deleted_flg: false,
                                        productAttribute: {
                                            deleted_flg: false
                                        }
                                    }
                                },
                                select: {
                                    productAttributeValues: {
                                        select: {
                                            id: true,
                                            value: true,
                                            productAttribute: {
                                                select: {
                                                    id: true,
                                                    name: true
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

            const productAttributes: Record<string, IProductAttribute> = {}

            product.productVariants.forEach(({ productVariantAttributeValues }) => {
                productVariantAttributeValues.forEach(({ productAttributeValues }) => {
                    const { id: attributeId, name } = productAttributeValues.productAttribute
                    const attributeValue = {
                        id: productAttributeValues.id,
                        value: productAttributeValues.value
                    }

                    if (!productAttributes[attributeId]) {
                        productAttributes[attributeId] = {
                            id: attributeId,
                            name,
                            product_attribute_values: []
                        }
                    }

                    const attributeValuesSet = new Set(
                        productAttributes[attributeId].product_attribute_values.map((val) => val.id)
                    )

                    if (!attributeValuesSet.has(attributeValue.id)) {
                        productAttributes[attributeId].product_attribute_values.push(attributeValue)
                    }
                })
            })

            let wishlistProductIds: Set<string> = new Set()
            let wishlistItems: string[] = []

            if (user?.id) {
                wishlistItems = await redis.smembers(createRedisKey(REDIS_KEY.USER_WISHLIST, user.id))

                if (!wishlistItems || wishlistItems.length === 0) {
                    const productWishlist = await prismaClient.wishlist.findMany({
                        where: { user_id: user?.id },
                        select: { product_id: true }
                    })

                    wishlistItems = productWishlist.map((_product) => _product.product_id)

                    if (wishlistItems.length > 0) {
                        await redis.sadd(createRedisKey(REDIS_KEY.USER_WISHLIST, user.id), wishlistItems)
                    }
                }

                wishlistProductIds = new Set(wishlistItems)
            }

            const flashDeal = product.flashDealProducts[0]

            const productVariants = product.productVariants.map(({ productPrices, ..._productVariant }) => {
                const getPrice = productPrices[0]

                let productPrice: ProductPrice = {
                    price: Number(getPrice.price),
                    special_price: Number(getPrice.special_price),
                    special_price_type: Number(getPrice.special_price_type)
                }

                if (flashDeal && flashDeal.flashDeal) {
                    productPrice = {
                        ...productPrice,
                        hasDiscount: true,
                        discounted_price: Number(flashDeal.flashDeal.discounted_price),
                        discounted_price_type: Number(flashDeal.flashDeal.discounted_price_type)
                    }
                }

                return {
                    ..._productVariant,
                    ...productPrice,
                    selling_price: formatSellingPrice(productPrice),
                    productPrices: undefined
                }
            })

            const productCategoryList = await UserProductCategoryClass.getNestedList(redis)
            const categoryMap: { [key: string]: IProductCategoryNestedListDTO | null } = {}

            flattenCategories(productCategoryList, categoryMap)

            return {
                ...product,
                breadcrumb: getBreadcrumbs(categoryMap, product.productCategory.id),
                isWishlist: wishlistProductIds ? wishlistProductIds.has(product.id) : false,
                flashDeal: flashDeal
                    ? {
                        ...flashDeal.flashDeal
                    }
                    : undefined,
                productAttributes: Object.values(productAttributes),
                productVariants,
                flashDealProducts: undefined
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    })

export const productReviews = new Elysia()
    .use(ProductModels)
    .use(authUserPlugin)
    .post(
        '/product-reviews', async ({ user, body, error }) => {
            if (!user || !user.id) throw error('Not Found')

            try {
                return await prismaClient.productReviews.create({
                    data: {
                        user_id: user.id,
                        product_id: body.product_id,
                        rating: body.rating,
                        content: body.content
                    }
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productReviews'
        }
    )

export const productReviewsPagination = new Elysia()
    .use(ProductModels)
    .get(
        '/product-reviews/:slug', async ({ params, query }) => {
            try {
                const take = query.pageSize || undefined
                const skip = query.page || undefined

                const search: Prisma.ProductReviewsWhereInput = {
                    product_id: params.slug,
                    deleted_flg: false
                }

                const [data, count] = await Promise.all([
                    prismaClient.productReviews.findMany({
                        take,
                        skip,
                        orderBy: {
                            created_at: 'desc'
                        },
                        where: search,
                        select: {
                            id: true,
                            rating: true,
                            content: true,
                            created_at: true,
                            users: {
                                select: {
                                    id: true,
                                    name: true,
                                    image_uri: true
                                }
                            }
                        }
                    }),
                    prismaClient.productReviews.count({
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
            query: 'productReviewsSearch'
        }
    )
