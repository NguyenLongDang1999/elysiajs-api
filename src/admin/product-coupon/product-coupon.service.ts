// ** Elysia Imports

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductCouponDTO, IProductCouponSearchDTO } from './product-coupon.type'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'
import { slugTimestamp } from '@utils/index'

export class ProductCouponService {
    async getTableList(query: IProductCouponSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductCouponWhereInput = {
                deleted_flg: false,
                code: {
                    contains: query.code || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: Number(query.status) || undefined
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
    }

    async create(data: IProductCouponDTO) {
        try {
            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.productCoupon.create({
                    data,
                    select: {
                        id: true
                    }
                })
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: IProductCouponDTO) {
        try {
            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.productCoupon.update({
                    data,
                    where: { id },
                    select: { id: true }
                })
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string) {
        try {
            return await prismaClient.productCoupon.findFirstOrThrow({
                where: {
                    id,
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
    }

    async delete(id: string, query: IDeleteDTO) {
        try {
            if (query.force) {
                await prismaClient.productCoupon.delete({
                    where: { id },
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
