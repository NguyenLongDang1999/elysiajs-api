// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productReviewsType = t.Object({
    product_id: t.String(),
    rating: t.Number(),
    content: t.String()
})

export const productReviewsSearchType = t.Object({
    ...paginationType
})

// ** Types
export type IProductReviewsDTO = Static<typeof productReviewsType>

export type IProductReviewsSearchDTO = Static<typeof productReviewsSearchType>
