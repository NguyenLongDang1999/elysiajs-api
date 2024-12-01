// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import {
    JWT,
    STATUS
} from '@utils/enums'
import { handleDatabaseError } from '@utils/error-handling'
import { formatSellingPrice } from '@utils/format'

// ** Models Imports
import { CartModels } from './cart.model'

// ** Class Imports
import { UserCartClass } from './cart.class'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'

export const cartDataList = new Elysia().use(authUserPlugin).get('/data-list', async ({ cookie }) => {
    try {
        const session_id = cookie.session_id.value

        if (session_id) {
            const product = await prismaClient.carts.findFirst({
                where: { session_id },
                select: {
                    id: true,
                    cartItem: {
                        where: {
                            productVariants: {
                                deleted_flg: false,
                                product: {
                                    deleted_flg: false,
                                    status: STATUS.ACTIVE,
                                    productCategory: {
                                        deleted_flg: false,
                                        status: STATUS.ACTIVE
                                    }
                                }
                            }
                        },
                        orderBy: {
                            created_at: 'desc'
                        },
                        select: {
                            id: true,
                            quantity: true,
                            productVariants: {
                                select: {
                                    id: true,
                                    productPrices: {
                                        select: {
                                            price: true,
                                            special_price: true,
                                            special_price_type: true
                                        }
                                    },
                                    product: {
                                        select: {
                                            id: true,
                                            slug: true,
                                            name: true,
                                            image_uri: true,
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
                                    },
                                    productVariantAttributeValues: {
                                        select: {
                                            productAttributeValues: {
                                                select: {
                                                    id: true,
                                                    value: true,
                                                    productAttribute: {
                                                        select: {
                                                            id: true,
                                                            name: true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            const cartItem = product?.cartItem.map((_c) => {
                const { productVariants } = _c
                const { productVariantAttributeValues, productPrices, product } = productVariants
                const { price, special_price, special_price_type } = productPrices[0]

                const flashDeals = product.flashDealProducts[0] ? product.flashDealProducts[0].flashDeal : undefined

                const productPrice = {
                    price: Number(price),
                    special_price: Number(special_price),
                    special_price_type: Number(special_price_type),
                    hasDiscount: !!flashDeals,
                    discounted_price: !!flashDeals ? Number(flashDeals.discounted_price) : 0,
                    discounted_price_type: !!flashDeals ? Number(flashDeals.discounted_price_type) : 0
                }

                const cartItemProductAttribute = productVariantAttributeValues
                    .map(
                        ({ productAttributeValues }) =>
                            `${productAttributeValues.productAttribute.name}: ${productAttributeValues.value}`
                    )
                    .join(', ')

                return {
                    ..._c,
                    product_variant_id: _c.productVariants.id,
                    product: {
                        ...productVariants.product,
                        ...productPrice,
                        selling_price: formatSellingPrice(productPrice)
                    },
                    cartItemProductAttribute
                }
            })

            return {
                ...product,
                cartItem
            }
        }

        return []
    } catch (error) {
        handleDatabaseError(error)
    }
})

export const cartCreate = new Elysia()
    .decorate({
        UserCartClass: new UserCartClass()
    })
    .use(authUserPlugin)
    .use(CartModels)
    .post(
        '/',
        async ({ UserCartClass, user, body, cookie }) => {
            try {
                const session_id = cookie.session_id.value
                let session_id_value = session_id

                if (!session_id_value) {
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
                    const cart = await UserCartClass.getOrCreateCart(prisma, user?.id, session_id_value)

                    await prisma.cartItem.upsert({
                        where: {
                            cart_id_product_variant_id: {
                                cart_id: cart.id,
                                product_variant_id: body.product_variant_id
                            }
                        },
                        update: {
                            quantity: {
                                increment: body.quantity
                            }
                        },
                        create: {
                            cart_id: cart.id,
                            product_variant_id: body.product_variant_id,
                            quantity: body.quantity
                        },
                        select: { id: true }
                    })

                    return cart
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'cart'
        }
    )

export const cartUpdate = new Elysia()
    .decorate({
        UserCartClass: new UserCartClass()
    })
    .use(authUserPlugin)
    .use(CartModels)
    .patch(
        '/',
        async ({ body }) => {
            try {
                return await prismaClient.$transaction(async (prisma) => {
                    for (const _data of body.updatedData) {
                        await prisma.cartItem.update({
                            where: {
                                id: _data.cart_item_id
                            },
                            data: {
                                quantity: _data.quantity
                            }
                        })
                    }

                    return { message: 'success' }
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'cartUpdate'
        }
    )

export const cartDelete = new Elysia()
    .decorate({
        UserCartClass: new UserCartClass()
    })
    .use(authUserPlugin)
    .use(CartModels)
    .delete(
        '/:id',
        async ({ params, query }) => {
            try {
                if (query.force) {
                    return await prismaClient.carts.delete({
                        where: { id: params.id }
                    })
                }

                return await prismaClient.cartItem.delete({
                    where: { id: params.id }
                })
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            query: 'cartDelete'
        }
    )
