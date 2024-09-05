// ** Elysia Imports
import { error } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteWishlistDTO, IWishlistDTO } from './wishlist.type'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class WishlistService {
    async getList(user_id: string) {
        try {
            const search: Prisma.WishlistWhereInput = {
                user_id,
                product: {
                    deleted_flg: false,
                    status: STATUS.ACTIVE,
                    productCategory: {
                        deleted_flg: false
                    }
                }
            }

            const wishlist = await prismaClient.wishlist.findMany({
                orderBy: {
                    created_at: 'desc'
                },
                where: search,
                select: {
                    id: true,
                    product: {
                        select: {
                            id: true,
                            slug: true,
                            name: true,
                            image_uri: true,
                            price: true,
                            special_price: true,
                            special_price_type: true,
                            total_rating: true,
                            product_type: true,
                            productCategory: {
                                select: {
                                    id: true,
                                    slug: true,
                                    name: true
                                }
                            },
                            flashDealProducts: {
                                where: {
                                    flashDeal: {
                                        status: STATUS.ACTIVE,
                                        start_time: {
                                            lte: new Date()
                                        },
                                        end_time: {
                                            gte: new Date()
                                        }
                                    }
                                },
                                select: {
                                    flashDeal: {
                                        select: {
                                            id: true,
                                            title: true,
                                            discounted_price: true,
                                            discounted_price_type: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            return wishlist.map(_wishlist => ({
                ..._wishlist,
                product: {
                    ..._wishlist.product,
                    isWishlist: true,
                    flashDeal: _wishlist.product.flashDealProducts[0] ? {
                        ..._wishlist.product.flashDealProducts[0].flashDeal
                    } : undefined,
                    productPrice: {
                        price: _wishlist.product.price,
                        special_price: _wishlist.product.special_price,
                        special_price_type: _wishlist.product.special_price_type
                    },
                    flashDealProducts: undefined
                }
            }))
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(user_id: string, data: IWishlistDTO) {
        try {
            const product = await prismaClient.product.findUnique({
                where: { id: data.product_id },
                select: {
                    id: true
                }
            })

            if (!product) {
                throw error('Not Found')
            }

            return prismaClient.wishlist.create({
                data: {
                    user_id,
                    product_id: data.product_id
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(user_id: string, data: IDeleteWishlistDTO) {
        try {
            const wishlistItem = await prismaClient.wishlist.findUnique({
                where: {
                    user_id_product_id: {
                        user_id,
                        product_id: data.id
                    }
                }
            })

            if (!wishlistItem) {
                throw error('Not Found')
            }

            return prismaClient.wishlist.delete({
                where: {
                    user_id_product_id: {
                        user_id,
                        product_id: data.id
                    }
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}