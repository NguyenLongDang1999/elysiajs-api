// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import {
    productReviewsSearchType,
    productReviewsType
} from './product-reviews.type'

export const productReviewsModels = new Elysia().model({
    productReviewsSearch: productReviewsSearchType,
    productReviews: productReviewsType
})
