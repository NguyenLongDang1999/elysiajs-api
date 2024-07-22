// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductBrandDTO, IProductBrandSearchDTO } from './product-brand.type'

// ** Utils Imports
import { slugTimestamp } from '@src/utils'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductBrandService {
    async getTableList(query: IProductBrandSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductBrandWhereInput = {
                deleted_flg: false,
                name: {
                    contains: query.name || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: Number(query.status) || undefined
                },
                productCategoryBrand: {
                    some: {
                        product_category_id: { equals: query.product_category_id || undefined }
                    }
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.productBrand.findMany({
                    take,
                    skip,
                    orderBy: { created_at: 'desc' },
                    where: search,
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        image_uri: true,
                        created_at: true,
                        product: {
                            where: { deleted_flg: false },
                            select: {
                                _count: true
                            }
                        },
                        productCategoryBrand: {
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
                prismaClient.productBrand.count({
                    where: search
                })
            ])

            return {
                data: data.map((item) => {
                    return {
                        ...item,
                        productCategoryBrand: item.productCategoryBrand.map(
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

    async create(data: IProductBrandDTO) {
        try {
            const { product_category_id, ...productBrandData } = data

            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.productBrand.create({
                    data: {
                        ...productBrandData,
                        productCategoryBrand: {
                            createMany: {
                                data: product_category_id.map((categoryItem) => ({
                                    product_category_id: categoryItem
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

    async update(id: string, data: IProductBrandDTO) {
        try {
            const { product_category_id, ...productBrandData } = data

            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.productBrand.update({
                    where: { id },
                    data: {
                        ...productBrandData,
                        productCategoryBrand: {
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
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string) {
        try {
            const productBrand = await prismaClient.productBrand.findFirst({
                where: {
                    id,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    image_uri: true,
                    description: true,
                    productCategoryBrand: {
                        select: { product_category_id: true }
                    }
                }
            })

            return {
                ...productBrand,
                product_category_id: productBrand.productCategoryBrand.map(
                    ({ product_category_id }) => product_category_id
                ),
                productCategoryBrand: undefined
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO) {
        try {
            if (query.force) {
                await prismaClient.productBrand.delete({
                    where: { id },
                    select: {
                        id: true
                    }
                })
            } else {
                await prismaClient.productBrand.update({
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
