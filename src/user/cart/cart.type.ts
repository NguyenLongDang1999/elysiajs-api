// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Definition
export const cartType = t.Object({
    product_variant_id: t.String(),
    quantity: t.Number()
})

// ** Types
export type ICartDTO = Static<typeof cartType>
