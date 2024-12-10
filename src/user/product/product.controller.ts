// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productRetrieve,
    productReviews,
    productReviewsPagination,
    productReviewsUsers
} from './product.service'

export const productController = new Elysia({ prefix: '/product' })
    .use(productRetrieve)
    .use(productReviews)
    .use(productReviewsPagination)
    .use(productReviewsUsers)
