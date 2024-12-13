// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productReviewsTableList,
    productReviewsUpdate
} from './product-reviews.service'

export const productReviewsController = new Elysia({ prefix: '/product-reviews' })
    .use(productReviewsTableList)
    .use(productReviewsUpdate)
