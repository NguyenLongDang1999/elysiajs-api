// ** Elysia Imports

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { IProductAttribute } from '../home/home.type'

export class ProductService {
    async retrieve(slug: string, user_id?: string) {
        try {
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

                    const attributeValuesSet = new Set(
                        productAttributes[attributeId].product_attribute_values.map((val) => val.id)
                    )

                    if (!attributeValuesSet.has(attributeValue.id)) {
                        productAttributes[attributeId].product_attribute_values.push(attributeValue)
                    }
                })
            })

            let isWishlist = false

            if (user_id) {
                const wishlistItems = await prismaClient.wishlist.findMany({
                    where: { user_id },
                    select: { product_id: true }
                })

                const wishlistProductIds = new Set(wishlistItems.map((item) => item.product_id))

                isWishlist = wishlistProductIds.has(product.id)
            }

            const formattedProduct = {
                ...product,
                isWishlist,
                flashDeal: product.flashDealProducts[0]
                    ? {
                        ...product.flashDealProducts[0].flashDeal
                    }
                    : undefined,
                productAttributes: Object.values(productAttributes),
                productVariants: product.productVariants.map(({ productPrices, ..._productVariant }) => ({
                    ..._productVariant,
                    ...productPrices[0],
                    productPrices: undefined
                })),
                flashDealProducts: undefined
            }

            return formattedProduct
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
