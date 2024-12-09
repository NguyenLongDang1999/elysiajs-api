// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productRetrieve,
    productReviews,
    productReviewsPagination
} from './product.service'

export const productController = new Elysia({ prefix: '/product' })
    .use(productRetrieve)
    .use(productReviews)
    .use(productReviewsPagination)
