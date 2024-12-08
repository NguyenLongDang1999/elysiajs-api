// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Definition
export const productReviewsType = t.Object({
    product_id: t.String(),
    rating: t.Number(),
    content: t.String()
})

// ** Types
export type IProductReviewsDTO = Static<typeof productReviewsType>
