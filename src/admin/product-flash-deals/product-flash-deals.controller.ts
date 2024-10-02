// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productFlashDealsCreate,
    productFlashDealsDataList,
    productFlashDealsDelete,
    productFlashDealsRetrieve,
    productFlashDealsTableList,
    productFlashDealsUpdate
} from './product-flash-deals.service'

export const productFlashDealsController = new Elysia({ prefix: '/product-flash-deals' })
    .use(productFlashDealsCreate)
    .use(productFlashDealsUpdate)
    .use(productFlashDealsDelete)
    .use(productFlashDealsRetrieve)
    .use(productFlashDealsDataList)
    .use(productFlashDealsTableList)
