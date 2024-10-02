// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { productInventoryModels } from './product-inventory.model'

export const productInventoryTableList = new Elysia().use(productInventoryModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductVariantsWhereInput = {
                deleted_flg: false,
                product: {
                    deleted_flg: false,
                    sku: { contains: query.sku || undefined, mode: 'insensitive' },
                    name: { contains: query.name || undefined, mode: 'insensitive' },
                    status: { equals: query.status || undefined },
                    product_type: { equals: query.product_type || undefined },
                    product_brand_id: { equals: query.product_brand_id || undefined },
                    product_category_id: { equals: query.product_category_id || undefined }
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
    },
    {
        query: 'productInventorySearch'
    }
)

export const productInventoryCreate = new Elysia().use(productInventoryModels).post(
    '/',
    async ({ body }) => {
        try {
            return await prismaClient.productInventory.create({
                data: body,
                select: {
                    id: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        body: 'productInventory'
    }
)
