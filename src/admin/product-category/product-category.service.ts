// ** Elysia Imports
import { RedisClientType } from '@libs/ioredis'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductCategoryDTO, IProductCategorySearchDTO } from './product-category.type'

// ** Utils Imports
import { createRedisKey, slugTimestamp } from '@utils/index'
import { REDIS_KEY } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductCategoryService {
    async getTableList(query: IProductCategorySearchDTO) {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductCategoryWhereInput = {
                deleted_flg: false,
                name: {
                    contains: query.name || undefined,
                    mode: 'insensitive'
                },
                parent_id: {
                    equals: query.parent_id || undefined
                },
                status: {
                    equals: query.status || undefined
                },
                productCategoryBrand: query.product_brand_id
                    ? {
                        some: {
                            product_brand_id: { contains: query.product_brand_id }
                        }
                    }
                    : undefined
            }

            const [data, count] = await Promise.all([
                prismaClient.productCategory.findMany({
                    take,
                    skip,
                    orderBy: {
                        created_at: 'desc'
                    },
                    where: search,
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        image_uri: true,
                        created_at: true,
                        parentCategory: {
                            select: {
                                id: true,
                                name: true,
                                image_uri: true,
                                _count: {
                                    select: {
                                        product: {
                                            where: {
                                                deleted_flg: false
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                product: {
                                    where: {
                                        deleted_flg: false
                                    }
                                }
                            }
                        }
                    }
                }),
                prismaClient.productCategory.count({
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

    async create(data: IProductCategoryDTO, redis: RedisClientType) {
        try {
            const productCategory = await prismaClient.productCategory.create({
                data,
                select: {
                    id: true
                }
            })

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: IProductCategoryDTO, redis: RedisClientType) {
        try {
            const productCategory = await prismaClient.productCategory.update({
                data,
                where: { id },
                select: {
                    id: true
                }
            })

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))
            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, id))

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string, redis: RedisClientType) {
        try {
            const productCategoryCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, id))

            if (productCategoryCached) {
                return JSON.parse(productCategoryCached)
            }

            const productCategory = await prismaClient.productCategory.findFirst({
                where: {
                    id,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    parent_id: true,
                    image_uri: true,
                    description: true,
                    meta_title: true,
                    meta_description: true
                }
            })

            await redis.set(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, id), JSON.stringify(productCategory))

            return productCategory
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO, redis: RedisClientType) {
        try {
            if (query.force) {
                await prismaClient.productCategory.delete({
                    where: { id },
                    select: {
                        id: true
                    }
                })
            } else {
                await prismaClient.productCategory.update({
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

            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))
            await redis.del(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, id))

            return id
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getDataList(redis: RedisClientType) {
        try {
            const productCategoryCached = await redis.get(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'))

            if (productCategoryCached) {
                return JSON.parse(productCategoryCached)
            }

            const categoryList = await prismaClient.productCategory.findMany({
                orderBy: { created_at: 'desc' },
                where: {
                    parent_id: null,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    name: true
                }
            })

            const categoryNested = []

            for (const category of categoryList) {
                const categories = await this.renderTree(category.id, 1)
                categoryNested.push(category, ...categories)
            }

            await redis.set(createRedisKey(REDIS_KEY.PRODUCT_CATEGORY, 'list'), JSON.stringify(categoryNested))

            return categoryNested
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async renderTree(parent_id: string, level: number) {
        const categories = await prismaClient.productCategory.findMany({
            where: {
                parent_id,
                deleted_flg: false
            },
            select: {
                id: true,
                name: true
            }
        })

        const customLevelName = '|--- '.repeat(level)

        let categoryNested: {
            id: string
            name: string
        }[] = []

        for (const category of categories) {
            const name = customLevelName + category.name
            categoryNested.push({ ...category, name: name })

            const children = await this.renderTree(category.id, level + 1)
            categoryNested = [...categoryNested, ...children]
        }

        return categoryNested
    }
}
