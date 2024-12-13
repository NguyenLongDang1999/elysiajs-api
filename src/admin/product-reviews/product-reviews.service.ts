// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { productReviewsModels } from './product-reviews.model'

export const productReviewsTableList = new Elysia().use(productReviewsModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductReviewsWhereInput = {
                deleted_flg: false,
                is_approved: {
                    equals: Boolean(query.is_approved) || undefined
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.productReviews.findMany({
                    take,
                    skip,
                    orderBy: {
                        created_at: 'desc'
                    },
                    where: search,
                    select: {
                        id: true,
                        rating: true,
                        content: true,
                        is_approved: true,
                        created_at: true,
                        product: {
                            select: {
                                id: true,
                                sku: true,
                                name: true,
                                image_uri: true,
                                review_count: true,
                                total_rating: true
                            }
                        },
                        users: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                image_uri: true
                            }
                        }
                    }
                }),
                prismaClient.productReviews.count({
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
        query: 'productReviewsSearch'
    }
)

export const productReviewsUpdate = new Elysia()
    .use(productReviewsModels)
    .patch(
        '/:id',
        async ({ body, params }) => {
            try {
                const productReviews = await prismaClient.productReviews.update({
                    data: body,
                    where: { id: params.id },
                    select: {
                        id: true
                    }
                })

                return productReviews
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'productReviews'
        }
    )
