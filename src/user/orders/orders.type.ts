// ** Elysia Imports
import { t } from 'elysia'

// ** Types Definition
export const createOrdersType = t.Object({
    name: t.String({ minLength: 1 }),
    phone: t.String({ minLength: 1 }),
    email: t.String({
        minLength: 1,
        format: 'email'
    }),
    shipping_address: t.String({ minLength: 1 }),
    note: t.Optional(t.String()),
    total_amount: t.Optional(t.Number()),
    total_after_discount: t.Optional(t.Number()),
    orderItem: t.Array(
        t.Object({
            product_variant_id: t.String(),
            quantity: t.Number(),
            price: t.Number()
        })
    )
})
