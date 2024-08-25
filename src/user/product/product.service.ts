// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { createRedisKey } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY, STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { IProductAttribute } from '../home/home.type'

export class ProductService {
    async retrieve(slug: string, redis: RedisClientType) {
        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_PRODUCT, slug)
            const cachedData = await redis.get(cachedKey)

            if (cachedData) {
                return JSON.parse(cachedData)
            }

            const product = await prismaClient.product.findFirstOrThrow({
                where: {
                    slug,
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
                    image_uri: true,
                    technical_specifications: true,
                    short_description: true,
                    description: true,
                    meta_title: true,
                    meta_description: true,
                    total_rating: true,
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

                    const attributeValuesSet = new Set(productAttributes[attributeId].product_attribute_values.map(val => val.id))

                    if (!attributeValuesSet.has(attributeValue.id)) {
                        productAttributes[attributeId].product_attribute_values.push(attributeValue)
                    }
                })
            })

            const formattedProduct = {
                ...product,
                flashDeal: product.flashDealProducts[0] ? {
                    ...product.flashDealProducts[0].flashDeal
                } : undefined,
                productAttributes: Object.values(productAttributes),
                productVariants: product.productVariants.map(({ productPrices, ..._productVariant }) => ({
                    ..._productVariant,
                    ...productPrices[0],
                    productPrices: undefined
                })),
                flashDealProducts: undefined
            }

            await redis.set(
                cachedKey,
                JSON.stringify(formattedProduct),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return formattedProduct
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
