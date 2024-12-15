// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import {
    ordersSearchType,
    orderUpdateStatusType
} from './orders.type'

export const ordersModels = new Elysia().model({
    ordersSearch: ordersSearchType,
    ordersDelete: deleteType,
    orderUpdateStatus: orderUpdateStatusType
})
