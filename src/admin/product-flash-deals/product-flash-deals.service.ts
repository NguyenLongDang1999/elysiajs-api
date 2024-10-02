// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { slugTimestamp } from '@src/utils'
import { STATUS } from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { productFlashDealsModels } from './product-flash-deals.model'

export const productFlashDealsTableList = new Elysia().use(productFlashDealsModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.FlashDealsWhereInput = {
                deleted_flg: false,
                title: {
                    contains: query.title || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: query.status || undefined
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.flashDeals.findMany({
                    take,
                    skip,
                    orderBy: {
                        created_at: 'desc'
                    },
                    where: search,
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        status: true,
                        start_time: true,
                        end_time: true,
                        created_at: true,
                        discounted_price: true,
                        discounted_price_type: true
                    }
                }),
                prismaClient.flashDeals.count({
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
        query: 'productFlashDealsSearch'
    }
)

export const productFlashDealsDataList = new Elysia().use(productFlashDealsModels).get('/data-list', async () => {
    try {
        const productFlashDealsData = await prismaClient.flashDeals.findMany({
            orderBy: { created_at: 'desc' },
            where: {
                deleted_flg: false,
                status: STATUS.ACTIVE
            },
            select: {
                id: true,
                title: true
            }
        })

        const productFlashDeals = productFlashDealsData.map((_v) => ({
            id: _v.id,
            name: _v.title
        }))

        return productFlashDeals
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const productFlashDealsRetrieve = new Elysia().get('/:id', async ({ params }) => {
    try {
        const productFlashDeals = await prismaClient.flashDeals.findFirstOrThrow({
            where: {
                id: params.id,
                deleted_flg: false
            },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                discounted_price: true,
                discounted_price_type: true,
                start_time: true,
                end_time: true,
                description: true,
                flashDealProducts: {
                    select: {
                        product_id: true
                    }
                }
            }
        })

        return {
            ...productFlashDeals,
            product_id: productFlashDeals.flashDealProducts.map((_f) => _f.product_id),
            flashDealProducts: undefined
        }
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const productFlashDealsCreate = new Elysia().use(productFlashDealsModels).post(
    '/',
    async ({ body }) => {
        try {
            const { product_id, ...productFlashDealData } = body

            return await prismaClient.flashDeals.create({
                data: {
                    ...productFlashDealData,
                    flashDealProducts: {
                        createMany: {
                            data: product_id.map((productItem) => ({
                                product_id: productItem
                            })),
                            skipDuplicates: true
                        }
                    }
                },
                select: {
                    id: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        body: 'productFlashDeals'
    }
)

export const productFlashDealsUpdate = new Elysia().use(productFlashDealsModels).patch(
    '/:id',
    async ({ body, params }) => {
        try {
            const { product_id, ...productFlashDealData } = body

            return await prismaClient.flashDeals.update({
                where: { id: params.id },
                data: {
                    ...productFlashDealData,
                    flashDealProducts: {
                        deleteMany: {},
                        createMany: {
                            data: product_id.map((productItem) => ({
                                product_id: productItem
                            })),
                            skipDuplicates: true
                        }
                    }
                },
                select: {
                    id: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        body: 'productFlashDeals'
    }
)

export const productFlashDealsDelete = new Elysia().use(productFlashDealsModels).delete(
    '/:id',
    async ({ query, params }) => {
        try {
            if (query.force) {
                await prismaClient.flashDeals.delete({
                    where: { id: params.id },
                    select: {
                        id: true
                    }
                })
            } else {
                await prismaClient.flashDeals.update({
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
        query: 'productFlashDealsDelete'
    }
)
