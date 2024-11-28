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
                        // code: true,
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
