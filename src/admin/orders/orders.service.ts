// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { ordersModels } from './orders.model'

export const ordersTableList = new Elysia().use(ordersModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.OrdersWhereInput = {
                deleted_flg: false,
                name: { contains: query.name || undefined, mode: 'insensitive' },
                email: { contains: query.email || undefined, mode: 'insensitive' },
                phone: { contains: query.phone || undefined, mode: 'insensitive' },
                status: { equals: query.status || undefined }
            }

            const [data, count] = await Promise.all([
                prismaClient.orders.findMany({
                    take,
                    skip,
                    orderBy: { created_at: 'desc' },
                    where: search,
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        total_amount: true,
                        total_after_discount: true,
                        created_at: true,
                        _count: {
                            select: {
                                orderItem: true
                            }
                        }
                    }
                }),
                prismaClient.orders.count({ where: search })
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
        query: 'ordersSearch'
    }
)

export const ordersRetrieve = new Elysia().get('/:id', async ({ params }) => {
    try {
        const orders = await prismaClient.orders.findFirst({
            where: {
                id: params.id
            },
            select: {
                id: true,
                code: true,
                name: true,
                email: true,
                phone: true,
                note: true,
                status: true,
                shipping_address: true,
                total_amount: true,
                total_after_discount: true,
                orderItem: {
                    select: {
                        id: true,
                        price: true,
                        quantity: true,
                        productVariants: {
                            select: {
                                id: true,
                                label: true,
                                product: {
                                    select: {
                                        id: true,
                                        slug: true,
                                        name: true,
                                        image_uri: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        return {
            ...orders,
            orderItem: orders?.orderItem.map((_order) => ({
                ..._order,
                ..._order.productVariants
            }))
        }
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const ordersUpdateStatus = new Elysia()
    .use(ordersModels)
    .patch('/:id', async ({ body, params }) => {
        try {
            return await prismaClient.orders.update({
                where: {
                    id: params.id
                },
                data: {
                    status: body.status
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }, {
        body: 'orderUpdateStatus'
    })
