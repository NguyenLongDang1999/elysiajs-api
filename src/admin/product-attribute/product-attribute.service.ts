// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'
import { slugTimestamp } from '@utils/index'

// ** Models Imports
import { productAttributeModels } from './product-attribute.model'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const productAttributeTableList = new Elysia().use(productAttributeModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductAttributeWhereInput = {
                deleted_flg: false,
                name: {
                    contains: query.name || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: query.status || undefined
                },
                productCategoryAttributes: query.product_category_id
                    ? {
                        some: {
                            product_category_id: { equals: query.product_category_id }
                        }
                    }
                    : undefined
            }

            const [data, count] = await Promise.all([
                prismaClient.productAttribute.findMany({
                    take,
                    skip,
                    orderBy: { created_at: 'desc' },
                    where: search,
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        status: true,
                        created_at: true,
                        _count: {
                            select: {
                                productAttributeValues: {
                                    where: {
                                        deleted_flg: false
                                    }
                                }
                            }
                        },
                        productCategoryAttributes: {
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
                prismaClient.productAttribute.count({
                    where: search
                })
            ])

            return {
                data: data.map((item) => {
                    return {
                        ...item,
                        productCategoryAttributes: item.productCategoryAttributes.map(
                            (categoryItem) => categoryItem.productCategory
                        )
                    }
                }),
                aggregations: count
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        query: 'productAttributeSearch'
    }
)

export const productAttributeDataListCategory = new Elysia()
    .use(redisPlugin)
    .get('data-list-category/:id', async ({ params }) => {
        try {
            const data = await prismaClient.productCategoryAttributes.findMany({
                orderBy: {
                    productAttribute: { created_at: 'desc' }
                },
                where: {
                    productCategory: { deleted_flg: false },
                    productAttribute: { deleted_flg: false },
                    product_category_id: params.id
                },
                select: {
                    productAttribute: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })

            return data.map((_v) => _v.productAttribute)
        } catch (error) {
            handleDatabaseError(error)
        }
    })

export const productAttributeDataListAttributeValue = new Elysia()
    .use(redisPlugin)
    .get('attribute-value-data-list/:id', async ({ params }) => {
        try {
            const productAttribute = await prismaClient.productAttribute.findFirstOrThrow({
                orderBy: { created_at: 'desc' },
                where: {
                    id: params.id,
                    deleted_flg: false
                },
                select: {
                    productAttributeValues: {
                        select: {
                            id: true,
                            value: true
                        }
                    }
                }
            })

            return productAttribute.productAttributeValues.map((_v) => ({
                id: _v.id,
                name: _v.value
            }))
        } catch (error) {
            handleDatabaseError(error)
        }
    })

export const productAttributeCreate = new Elysia()
    .use(redisPlugin)
    .use(productAttributeModels)
    .post(
        '/',
        async ({ body }) => {
            try {
                const { product_category_id, product_attribute_values, ...productAttributeData } = body

                return await prismaClient.$transaction(async (prisma) => {
                    return await prisma.productAttribute.create({
                        data: {
                            ...productAttributeData,
                            productCategoryAttributes: {
                                createMany: {
                                    data: product_category_id.map((categoryItem) => ({
                                        product_category_id: categoryItem
                                    })),
                                    skipDuplicates: true
                                }
                            },
                            productAttributeValues: {
                                createMany: {
                                    data: product_attribute_values.map((valueItem) => ({
                                        value: valueItem.value
                                    })),
                                    skipDuplicates: true
                                }
                            }
                        },
                        select: { id: true }
                    })
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productAttribute'
        }
    )

export const productAttributeUpdate = new Elysia()
    .use(redisPlugin)
    .use(productAttributeModels)
    .patch(
        '/:id',
        async ({ body, params }) => {
            try {
                const { product_category_id, product_attribute_values, ...productAttributeData } = body

                return await prismaClient.$transaction(async (prisma) => {
                    const updatedProductAttribute = await prisma.productAttribute.update({
                        where: { id: params.id },
                        data: {
                            ...productAttributeData,
                            productCategoryAttributes: {
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

                    const existingOptions = await prisma.productAttributeValues.findMany({
                        where: { product_attribute_id: params.id }
                    })

                    const existingOptionsMap = new Map(existingOptions.map((option) => [option.id, option]))

                    for (const option of product_attribute_values) {
                        const existingOption = existingOptionsMap.get(option.id as string)

                        if (existingOption) {
                            await prisma.productAttributeValues.update({
                                where: { id: existingOption.id },
                                data: { value: option.value }
                            })

                            existingOptionsMap.delete(option.id as string)
                        } else {
                            await prisma.productAttributeValues.create({
                                data: {
                                    value: option.value,
                                    product_attribute_id: params.id
                                }
                            })
                        }
                    }

                    if (existingOptionsMap.size > 0) {
                        await prisma.productAttributeValues.deleteMany({
                            where: {
                                id: {
                                    in: Array.from(existingOptionsMap.keys())
                                }
                            }
                        })
                    }

                    return updatedProductAttribute
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productAttribute'
        }
    )

export const productAttributeDelete = new Elysia()
    .use(redisPlugin)
    .use(productAttributeModels)
    .delete(
        '/:id',
        async ({ query, params }) => {
            try {
                if (query.force) {
                    await prismaClient.productAttribute.delete({
                        where: { id: params.id },
                        select: {
                            id: true
                        }
                    })
                } else {
                    await prismaClient.productAttribute.update({
                        data: {
                            deleted_flg: true,
                            slug: slugTimestamp(query.slug as string)
                        },
                        where: { id: params.id },
                        select: {
                            id: true
                        }
                    })
                }

                return params.id
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            query: 'productAttributeDelete'
        }
    )

export const productAttributeRetrieve = new Elysia().use(redisPlugin).get('/:id', async ({ params }) => {
    try {
        const productAttribute = await prismaClient.productAttribute.findFirst({
            where: {
                id: params.id,
                deleted_flg: false
            },
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                description: true,
                productCategoryAttributes: {
                    select: { product_category_id: true }
                },
                productAttributeValues: {
                    where: { deleted_flg: false },
                    select: {
                        id: true,
                        value: true
                    }
                }
            }
        })

        return {
            ...productAttribute,
            product_category_id: productAttribute?.productCategoryAttributes.map(
                ({ product_category_id }) => product_category_id
            ),
            product_attribute_values: productAttribute?.productAttributeValues.map((valueItem) => valueItem),
            productAttributeValues: undefined,
            productCategoryAttributes: undefined
        }
    } catch (error) {
        handleDatabaseError(error)
    }
})
