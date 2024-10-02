// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Definition
export const cartType = t.Object({
    product_variant_id: t.String(),
    quantity: t.Number()
})

export const cartUpdateType = t.Object({
    updatedData: t.Array(
        t.Object({
            cart_item_id: t.String(),
            quantity: t.Number()
        })
    )
})

export const cartDeleteType = t.Object({
    force: t.Optional(t.String())
})

// ** Types
export type ICartDTO = Static<typeof cartType>

export type ICartDeleteDTO = Static<typeof cartDeleteType>

export type ICartUpdateDTO = Static<typeof cartUpdateType>
