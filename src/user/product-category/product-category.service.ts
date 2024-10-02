// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
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

// ** Class Imports
import { UserProductCategoryClass } from './product-category.class'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'
import { authUserPlugin } from '../plugins/auth'

// ** Types Imports
import { IProductCategoryNestedListDTO } from './product-category.type'

// ** Models Imports
import { productCategoryModels } from './product-category.model'

export const productCategoryNestedList = new Elysia()
    .decorate({
        UserProductCategoryClass: new UserProductCategoryClass()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .get('/data-list-nested', async ({ UserProductCategoryClass, redis }) => UserProductCategoryClass.getNestedList(redis))

export const productCategoryDataListShop = new Elysia()
    .decorate({
        UserProductCategoryClass: new UserProductCategoryClass()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .use(productCategoryModels)
    .get('/data-list-shop', async ({ UserProductCategoryClass, query, redis, user }) => {
        try {
            return await UserProductCategoryClass.getListProductShop(query, redis, undefined, user?.id)
        } catch (error) {
            handleDatabaseError(error)
        }
    }, {
        query: 'userProductCategorySearch'
    })

export const productCategoryRetrieve = new Elysia()
    .decorate({
        UserProductCategoryClass: new UserProductCategoryClass()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .use(productCategoryModels)
    .get('/:slug', async ({ UserProductCategoryClass, params, query, redis, user }) => {
        try {
            const cachedKey = createRedisKey(REDIS_KEY.USER_PRODUCT_CATEGORY_RETRIEVE, params.slug)

            let productCategory
            const cachedData = await redis.get(cachedKey)

            if (cachedData) {
                productCategory = JSON.parse(cachedData)
            } else {
                productCategory = await prismaClient.productCategory.findFirstOrThrow({
                    where: {
                        slug: params.slug,
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

            const { data: product, aggregations } = await UserProductCategoryClass.getListProductShop(
                query,
                redis,
                productCategory.id,
                user?.id
            )

            const productCategoryList = await UserProductCategoryClass.getNestedList(redis)
            const categoryMap: { [key: string]: IProductCategoryNestedListDTO | null } = {}

            flattenCategories(productCategoryList, categoryMap)

            return {
                ...productCategory,
                aggregations,
                product,
                breadcrumb: getBreadcrumbs(categoryMap, productCategory.id),
                productBrands: productCategory.productCategoryBrand.map((_item: any) => _item.productBrand),
                productAttributes: productCategory.productCategoryAttributes.map((_item: any) => ({
                    id: _item.productAttribute.id,
                    name: _item.productAttribute.name,
                    product_attribute_values: _item.productAttribute.productAttributeValues.map((_values: any) => ({
                        id: _values.id,
                        value: _values.value
                    }))
                }))
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }, {
        query: 'userProductCategorySearch'
    })
