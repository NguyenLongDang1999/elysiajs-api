// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import {
    productReviewsSearchType,
    productReviewsType
} from './product.type'

export const ProductModels = new Elysia().model({
    productReviews: productReviewsType,
    productReviewsSearch: productReviewsSearchType
})
