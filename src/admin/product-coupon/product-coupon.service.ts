// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'
import { slugTimestamp } from '@utils/index'

// ** Models Imports
import { productCouponModels } from './product-coupon.model'

export const productCouponTableList = new Elysia().use(productCouponModels).get(
    '/',
    async ({ query }) => {
        try {
            const take = query.pageSize || undefined
            const skip = query.page || undefined

            const search: Prisma.ProductCouponWhereInput = {
                deleted_flg: false,
                code: {
                    contains: query.code || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: query.status || undefined
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.productCoupon.findMany({
                    take,
                    skip,
                    orderBy: {
                        created_at: 'desc'
                    },
                    where: search,
                    select: {
                        id: true,
                        code: true,
                        status: true,
                        discount_type: true,
                        discount_value: true,
                        start_date: true,
                        end_date: true,
                        minimum_order_value: true,
                        max_uses: true,
                        times_used: true,
                        user_limit: true,
                        created_at: true
                    }
                }),
                prismaClient.productCoupon.count({
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
        query: 'productCouponSearch'
    }
)

export const productCouponRetrieve = new Elysia().get('/:id', async ({ params }) => {
    try {
        return await prismaClient.productCoupon.findFirstOrThrow({
            where: {
                id: params.id,
                deleted_flg: false
            },
            select: {
                id: true,
                code: true,
                description: true,
                status: true,
                discount_type: true,
                discount_value: true,
                start_date: true,
                end_date: true,
                max_uses: true,
                minimum_order_value: true,
                times_used: true,
                user_limit: true
            }
        })
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const productCouponCreate = new Elysia().use(productCouponModels).post(
    '/',
    async ({ body }) => {
        try {
            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.productCoupon.create({
                    data: body,
                    select: {
                        id: true
                    }
                })
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        body: 'productCoupon'
    }
)

export const productCouponUpdate = new Elysia().use(productCouponModels).patch(
    '/:id',
    async ({ body, params }) => {
        try {
            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.productCoupon.update({
                    data: body,
                    where: { id: params.id },
                    select: { id: true }
                })
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    },
    {
        body: 'productCoupon'
    }
)

export const productCouponDelete = new Elysia().use(productCouponModels).delete(
    '/:id',
    async ({ query, params }) => {
        try {
            if (query.force) {
                await prismaClient.productCoupon.delete({
                    where: { id: params.id },
                    select: {
                        id: true
                    }
                })
            } else {
                await prismaClient.productCoupon.update({
                    data: {
                        deleted_flg: true,
                        code: slugTimestamp(query.slug as string)
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
        query: 'productCouponDelete'
    }
)
