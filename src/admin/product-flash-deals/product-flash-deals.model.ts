// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import {
    productFlashDealsSearchType,
    productFlashDealsType
} from './product-flash-deals.type'

export const productFlashDealsModels = new Elysia().model({
    productFlashDeals: productFlashDealsType,
    productFlashDealsSearch: productFlashDealsSearchType,
    productFlashDealsDelete: deleteType
})
