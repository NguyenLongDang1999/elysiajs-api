// ** Elysia Imports
import { Cookie } from 'elysia'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { ICartDTO } from './cart.type'

// ** Utils Imports
import { JWT } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class CartService {
    async create(cookie: Record<string, Cookie<any>>, data: ICartDTO, user_id?: string, session_id?: string) {
        try {
            let session_id_value = session_id

            if (!session_id) {
                session_id_value = createId()

                cookie.session_id.set({
                    value: session_id_value,
                    maxAge: Number(JWT.SESSION_ID_EXP),
                    secure: Bun.env.NODE_ENV === 'production',
                    httpOnly: Bun.env.NODE_ENV === 'production',
                    sameSite: Bun.env.NODE_ENV === 'production'
                })
            }

            return await prismaClient.$transaction(async (prisma) => {
                const cart = await this.getOrCreateCart(prisma, user_id, session_id_value)

                await prisma.cartItem.upsert({
                    where: {
                        cart_id_product_variant_id: {
                            cart_id: cart.id,
                            product_variant_id: data.product_variant_id
                        }
                    },
                    update: {
                        quantity: {
                            increment: data.quantity
                        }
                    },
                    create: {
                        cart_id: cart.id,
                        product_variant_id: data.product_variant_id,
                        quantity: data.quantity
                    },
                    select: { id: true }
                })

                return cart
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    private async getOrCreateCart(
        prisma: any,
        user_id?: string,
        session_id?: string
    ) {
        if (session_id) {
            const cart = await prisma.carts.findFirst({
                where: { session_id },
                select: {
                    id: true,
                    session_id: true
                }
            })

            if (cart) {
                return cart
            }
        }

        return await prisma.carts.create({
            data: {
                user_id: session_id ? null : user_id,
                session_id: session_id || undefined
            },
            select: {
                id: true,
                session_id: true
            }
        })
    }
}
