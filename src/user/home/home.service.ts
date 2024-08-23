// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { EXPIRES_AT, REDIS_KEY, STATUS } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { createRedisKey } from '@utils/index'

// ** Service Imports
import { SystemSettingsService } from '../system-settings/system-settings.service'

// ** Types Imports
import { IHomeProductCollectionDTO, IHomeProductFlashDealsDTO, IProductAttribute } from './home.type'

export class HomeService {
    async data(SystemSettingsService: SystemSettingsService, redis: RedisClientType) {
        try {
            const systemSettings = await SystemSettingsService.getDataList({ key: 'home_' }, redis)

            const homeSystem = (key: string) => systemSettings.find((system: { key: string | string[] }) => system.key.includes(key))

            const getParseValueWithKey = (key: string) => {
                const system = homeSystem(key)

                return system && system.key === key ? JSON.parse(system.value) : []
            }

            const slider = getParseValueWithKey('home_slider')
            const product_category_popular = getParseValueWithKey('home_product_categories_popular')
            const product_collection = getParseValueWithKey('home_product_collection')
            const product_flash_deals = getParseValueWithKey('home_product_flash_deals')

            const flashDealData = await this.getProductFlashDeals(product_flash_deals, redis)
            const productCategoryData = await this.getProductCategoryPopular(product_category_popular, redis)
            const productCollectionData = await this.getProductCollection(product_collection, redis)

            return {
                slider,
                product_flash_deals: flashDealData,
                product_collection: productCollectionData,
                product_categories_popular: productCategoryData
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getProductFlashDeals(product_flash_deals: IHomeProductFlashDealsDTO, redis: RedisClientType) {
        try {
            // const cachedKey = createRedisKey(REDIS_KEY.USER_HOME_FLASH_DEALS, product_flash_deals.flash_deals_id)
            // const cachedData = await redis.get(cachedKey)

            // if (cachedData) {
            //     return JSON.parse(cachedData)
            // }

            const productFlashDeals = await prismaClient.flashDeals.findFirst({
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
                                    sku: true,
                                    slug: true,
                                    name: true,
                                    image_uri: true,
                                    short_description: true,
                                    total_rating: true,
                                    productImages: {
                                        orderBy: { index: 'asc' },
                                        select: { image_uri: true }
                                    },
                                    productBrand: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    },
                                    productCategory: {
                                        select: {
                                            id: true,
                                            slug: true,
                                            name: true
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
                            }
                        }
                    }
                }
            })

            return {
                ...productFlashDeals,
                flashDealProducts: productFlashDeals?.flashDealProducts.map(_flashDeal => {
                    const productAttributes: Record<string, IProductAttribute> = {}

                    _flashDeal.product.productVariants.forEach(({ productVariantAttributeValues }) => {
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

                    return {
                        ..._flashDeal.product,
                        productAttributes: Object.values(productAttributes),
                        productVariants: _flashDeal.product.productVariants.map(({ productPrices, ..._productVariant }) => ({
                            ..._productVariant,
                            ...productPrices[0],
                            productPrices: undefined
                        }))
                    }
                })
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getProductCategoryPopular(product_category_popular: string[], redis: RedisClientType) {
        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_HOME_PRODUCT_CATEGORY_POPULAR, product_category_popular.join(', '))
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

            await redis.set(
                cachedKey,
                JSON.stringify(productCategory),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getProductCollection(product_collection: IHomeProductCollectionDTO, redis: RedisClientType) {
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

                    await redis.set(
                        cachedKey,
                        JSON.stringify(result),
                        EXPIRES_AT.REDIS_EXPIRES_AT
                    )

                    return result
                })
            )

            return await Promise.all(
                productCollectionData.map(async (_pcd) => {
                    return {
                        ..._pcd,
                        product: await Promise.all(
                            _pcd.productCollectionProduct.map(async (_p: any) => ({
                                ..._p.product,
                                flashDeal: _p.product.flashDealProducts[0] ? {
                                    ..._p.product.flashDealProducts[0].flashDeal
                                } : undefined,
                                productPrice: {
                                    price: _p.product.price,
                                    special_price: _p.product.special_price,
                                    special_price_type: _p.product.special_price_type
                                },
                                flashDealProducts: undefined
                            }))
                        )
                    }
                })
            )
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
