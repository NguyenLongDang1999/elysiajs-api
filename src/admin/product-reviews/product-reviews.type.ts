// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productReviewsType = t.Object({
    is_approved: t.Boolean()
})

export const productReviewsSearchType = t.Object({
    ...paginationType,
    user_id: t.Optional(t.String()),
    product_id: t.Optional(t.String()),
    rating: t.Optional(t.Number()),
    is_approved: t.Optional(t.String())
})

// ** Types
export type IProductReviewsSearchDTO = Static<typeof productReviewsSearchType>
