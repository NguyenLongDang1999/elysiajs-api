// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Models Imports
import { orderModels } from './orders.model'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

export const ordersCreate = new Elysia()
    .use(orderModels)
    .post('/', async ({ body, cookie }) => {
        try {
            const { orderItem, ...data } = body

            return await prismaClient.$transaction(async (prisma) => {
                const orders = await prisma.orders.create({
                    data: {
                        ...data,
                        orderItem: {
                            create: orderItem.map(_order => ({
                                product_variant_id: _order.product_variant_id,
                                quantity: _order.quantity,
                                price: _order.price
                            }))
                        }
                    },
                    select: {
                        id: true
                    }
                })

                const session_id = cookie.session_id.value

                if (session_id) {
                    await prisma.carts.delete({
                        where: {
                            session_id
                        }
                    })
                }

                return orders
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }, {
        body: 'createOrders'
    })

export const ordersSuccessfully = new Elysia()
    .get('/:id', async ({ params }) => {
        try {
            return await prismaClient.orders.findFirst({
                where: {
                    id: params.id
                },
                select: {

                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    })