// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { productReviewsSearchType } from './product-reviews.type'

export const productReviewsModels = new Elysia().model({
    productReviewsSearch: productReviewsSearchType
})
