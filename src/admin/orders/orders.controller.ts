// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    ordersRetrieve,
    ordersTableList
} from './orders.service'

export const ordersController = new Elysia({ prefix: '/orders' })
    .use(ordersTableList)
    .use(ordersRetrieve)
