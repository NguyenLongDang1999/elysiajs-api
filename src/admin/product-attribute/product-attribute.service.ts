// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductAttributeDTO, IProductAttributeSearchDTO } from './product-attribute.type'

// ** Utils Imports
import { slugTimestamp } from '@src/utils'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductAttributeService {
    async getTableList(query: IProductAttributeSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductAttributeWhereInput = {
                deleted_flg: false,
                name: {
                    contains: query.name || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: Number(query.status) || undefined
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
                        productAttributeValues: {
                            where: {
                                deleted_flg: false
                            },
                            select: {
                                _count: true
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
    }

    async create(data: IProductAttributeDTO) {
        try {
            const { product_category_id, product_attribute_values, ...productAttributeData } = data

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
    }

    async update(id: string, data: IProductAttributeDTO) {
        try {
            const { product_category_id, product_attribute_values, ...productAttributeData } = data

            return await prismaClient.$transaction(async (prisma) => {
                const updatedProductAttribute = await prisma.productAttribute.update({
                    where: { id },
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
                    where: { product_attribute_id: id }
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
                                product_attribute_id: id
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
    }

    async retrieve(id: string) {
        try {
            const productAttribute = await prismaClient.productAttribute.findFirst({
                where: {
                    id,
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
    }

    async delete(id: string, query: IDeleteDTO) {
        try {
            if (query.force) {
                await prismaClient.productAttribute.delete({
                    where: { id },
                    select: {
                        id: true
                    }
                })
            } else {
                await prismaClient.productAttribute.update({
                    data: {
                        deleted_flg: true,
                        slug: slugTimestamp(query.slug!)
                    },
                    where: { id },
                    select: {
                        id: true
                    }
                })
            }

            return id
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
