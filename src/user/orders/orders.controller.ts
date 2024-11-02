// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { ordersCreate } from './orders.service'

export const ordersController = new Elysia({ prefix: '/orders' })
    .use(ordersCreate)
