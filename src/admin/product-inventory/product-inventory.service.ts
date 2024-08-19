// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IProductInventoryDTO, IProductInventorySearchDTO } from './product-inventory.type'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

export class ProductInventoryService {
    async getTableList(query: IProductInventorySearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductVariantsWhereInput = {
                deleted_flg: false,
                product: {
                    deleted_flg: false,
                    name: { contains: query.name || undefined, mode: 'insensitive' },
                    status: { equals: Number(query.status) || undefined },
                    product_type: { equals: Number(query.product_type) || undefined },
                    product_brand_id: { equals: query.product_brand_id || undefined },
                    product_category_id: { equals: query.product_category_id || undefined },
                    productVariants: query.sku
                        ? {
                            some: {
                                sku: { contains: query.sku, mode: 'insensitive' }
                            }
                        }
                        : undefined
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.productVariants.findMany({
                    take,
                    skip,
                    orderBy: {
                        created_at: 'desc'
                    },
                    where: search,
                    select: {
                        id: true,
                        label: true,
                        product: {
                            select: {
                                id: true,
                                sku: true,
                                slug: true,
                                name: true,
                                status: true,
                                image_uri: true,
                                product_type: true
                            }
                        },
                        productInventory: {
                            select: {
                                quantity: true
                            }
                        }
                    }
                }),
                prismaClient.productVariants.count({
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

    async create(data: IProductInventoryDTO) {
        try {
            return await prismaClient.productInventory.create({
                data,
                select: {
                    id: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
