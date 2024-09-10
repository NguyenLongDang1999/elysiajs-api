// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { createRedisKey, getNormalizedList, getProductOrderBy } from '@utils/index'
import { REDIS_KEY, STATUS } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { formatSellingPrice } from '@utils/format'

// ** Types Imports
import { IProductCategoryNestedListDTO, IProductCategorySearchDTO } from './product-category.type'

export class ProductCategoryService {
    async getNestedList(redis: RedisClientType) {
        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_PRODUCT_CATEGORY, 'nested-list')
            const cachedData = await redis.get(cachedKey)

            if (cachedData) {
                return JSON.parse(cachedData)
            }

            const categoryList = await prismaClient.productCategory.findMany({
                orderBy: { created_at: 'desc' },
                where: {
                    parent_id: null,
                    deleted_flg: false,
                    status: STATUS.ACTIVE
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image_uri: true,
                    parent_id: true
                }
            })

            const categoryNested = []

            for (const category of categoryList) {
                const children = await this.renderTree(category.id, 1)

                const categoryWithChildren = {
                    ...category,
                    children
                }

                categoryNested.push(categoryWithChildren)
            }

            await redis.set(cachedKey, JSON.stringify(categoryNested))

            return categoryNested
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async renderTree(parentId: string, level: number) {
        const categories = await prismaClient.productCategory.findMany({
            where: {
                parent_id: parentId,
                deleted_flg: false,
                status: STATUS.ACTIVE
            },
            select: {
                id: true,
                name: true,
                slug: true,
                image_uri: true,
                parent_id: true
            }
        })

        const categoryNested: IProductCategoryNestedListDTO[] = []

        for (const category of categories) {
            const children = await this.renderTree(category.id, level + 1)

            const categoryWithChildren: IProductCategoryNestedListDTO = {
                ...category,
                children
            }

            categoryNested.push(categoryWithChildren)
        }

        return categoryNested
    }

    async retrieve(slug: string, query: IProductCategorySearchDTO, redis: RedisClientType, user_id?: string) {
        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_PRODUCT_CATEGORY_RETRIEVE, slug)

            let productCategory
            const cachedData = await redis.get(cachedKey)

            if (cachedData) {
                productCategory = JSON.parse(cachedData)
            } else {
                productCategory = await prismaClient.productCategory.findFirstOrThrow({
                    where: {
                        slug,
                        deleted_flg: false,
                        status: STATUS.ACTIVE
                    },
                    select: {
                        id: true,
                        name: true,
                        image_uri: true,
                        description: true,
                        meta_title: true,
                        meta_description: true,
                        productCategoryBrand: {
                            where: {
                                productBrand: {
                                    deleted_flg: false,
                                    status: STATUS.ACTIVE
                                }
                            },
                            select: {
                                productBrand: true
                            }
                        },
                        productCategoryAttributes: {
                            where: {
                                productAttribute: {
                                    deleted_flg: false,
                                    status: STATUS.ACTIVE
                                }
                            },
                            select: {
                                productAttribute: {
                                    include: {
                                        productAttributeValues: true
                                    }
                                }
                            }
                        }
                    }
                })

                if (productCategory) {
                    await redis.set(cachedKey, JSON.stringify(productCategory))
                }
            }

            const { data: product, aggregations } = await this.getListProductShop(
                query,
                redis,
                productCategory.id,
                user_id
            )

            const formattedProductCategory = {
                ...productCategory,
                aggregations,
                product,
                productBrands: productCategory.productCategoryBrand.map((_item) => _item.productBrand),
                productAttributes: productCategory.productCategoryAttributes.map((_item) => ({
                    id: _item.productAttribute.id,
                    name: _item.productAttribute.name,
                    product_attribute_values: _item.productAttribute.productAttributeValues.map((_values) => ({
                        id: _values.id,
                        value: _values.value
                    }))
                }))
            }

            return formattedProductCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getDataListShop(query: IProductCategorySearchDTO, redis: RedisClientType, user_id?: string) {
        try {
            return await this.getListProductShop(query, redis, undefined, user_id)
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getListProductShop(
        query: IProductCategorySearchDTO,
        redis: RedisClientType,
        categoryId?: string,
        user_id?: string
    ) {
        const allCategories = categoryId ? await this.getAllSubcategories(categoryId) : undefined
        const categoryIds = allCategories?.map((category) => category.id)

        const search: Prisma.ProductWhereInput = {
            deleted_flg: false,
            status: STATUS.ACTIVE,
            productCategory: {
                deleted_flg: false,
                status: STATUS.ACTIVE,
                id: categoryIds ? { in: categoryIds } : undefined
            },
            product_brand_id: {
                in: getNormalizedList(query.productBrands as string[])
            },
            ...(query.productAttributes && {
                productVariants: {
                    some: {
                        productVariantAttributeValues: {
                            some: {
                                product_attribute_value_id: {
                                    in: getNormalizedList(query.productAttributes as string[])
                                }
                            }
                        }
                    }
                }
            }),
            ...(query.productRating &&
                query.productRating.length > 0 && {
                OR: getNormalizedList(query.productRating as string[])?.map((rate) => ({
                    total_rating:
                            Number(rate) === 5
                                ? Number(rate)
                                : {
                                    gte: Number(rate),
                                    lte: Number(rate) + 1
                                }
                }))
            })
        }

        const product = await prismaClient.product.findMany({
            take: Number(query.pageSize),
            skip: Number(query.page),
            orderBy: getProductOrderBy(query.sort),
            where: search,
            select: {
                id: true,
                slug: true,
                name: true,
                image_uri: true,
                price: true,
                short_description: true,
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
        })

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

        for (const _product of product || []) {
            const isWishlist = wishlistProductIds ? wishlistProductIds.has(_product.id) : false
            const productPrice = {
                price: Number(_product.price),
                special_price: Number(_product.special_price),
                special_price_type: Number(_product.special_price_type)
            }

            formattedProduct.push({
                ..._product,
                ...productPrice,
                selling_price: formatSellingPrice(productPrice),
                isWishlist,
                flashDeal: _product.flashDealProducts[0]
                    ? {
                        ..._product.flashDealProducts[0].flashDeal
                    }
                    : undefined,
                product_variant_id: _product.productVariants ? _product.productVariants[0].id : undefined,
                productPrice: {
                    price: _product.price,
                    special_price: _product.special_price,
                    special_price_type: _product.special_price_type
                },
                productVariants: undefined,
                flashDealProducts: undefined
            })
        }

        return {
            data: formattedProduct,
            aggregations: await prismaClient.product.count({ where: search })
        }
    }

    async getAllSubcategories(categoryId: string): Promise<{ id: string; name: string }[]> {
        const subcategoryIds: { id: string; name: string }[] = await prismaClient.$queryRaw`
            WITH RECURSIVE CategoryHierarchy AS (
                SELECT id, parent_id
                FROM "ProductCategory"
                WHERE id = ${categoryId} AND deleted_flg = false AND status = ${STATUS.ACTIVE}
                UNION ALL
                SELECT c.id, c.parent_id
                FROM "ProductCategory" c
                JOIN CategoryHierarchy ch ON c.parent_id = ch.id
                WHERE c.deleted_flg = false AND c.status = ${STATUS.ACTIVE}
            )
            SELECT id FROM CategoryHierarchy
        `

        return subcategoryIds
    }
}
