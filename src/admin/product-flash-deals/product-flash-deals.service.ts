// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'
import { IProductFlashDealsDTO, IProductFlashDealsSearchDTO } from './product-flash-deals.type'

// ** Utils Imports
import { slugTimestamp } from '@src/utils'
import { STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductFlashDealsService {
    async getTableList(query: IProductFlashDealsSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.FlashDealsWhereInput = {
                deleted_flg: false,
                title: {
                    contains: query.title || undefined,
                    mode: 'insensitive'
                },
                status: {
                    equals: Number(query.status) || undefined
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
    }

    async create(data: IProductFlashDealsDTO) {
        try {
            const { product_id, ...productFlashDealData } = data

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
    }

    async update(id: string, data: IProductFlashDealsDTO) {
        try {
            const { product_id, ...productFlashDealData } = data

            return await prismaClient.flashDeals.update({
                where: { id },
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
    }

    async retrieve(id: string) {
        try {
            const productFlashDeals = await prismaClient.flashDeals.findFirstOrThrow({
                where: {
                    id,
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
                product_id: productFlashDeals.flashDealProducts.map(_f => _f.product_id),
                flashDealProducts: undefined
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO) {
        try {
            if (query.force) {
                await prismaClient.productCollection.delete({
                    where: { id },
                    select: {
                        id: true
                    }
                })
            } else {
                await prismaClient.productCollection.update({
                    data: {
                        deleted_flg: true,
                        slug: slugTimestamp(query.slug as string)
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

    async getDataList() {
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

            const productCollection = productFlashDealsData.map((_v) => ({
                id: _v.id,
                name: _v.title
            }))

            return productCollection
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
