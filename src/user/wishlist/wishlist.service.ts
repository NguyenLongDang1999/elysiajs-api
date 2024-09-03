// ** Elysia Imports
import { error } from 'elysia'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IDeleteWishlistDTO, IWishlistDTO } from './wishlist.type'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

export class WishlistService {
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
