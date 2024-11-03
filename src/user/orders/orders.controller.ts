// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { ordersCreate, ordersSuccessfully } from './orders.service'

export const ordersController = new Elysia({ prefix: '/orders' })
    .use(ordersCreate)
    .use(ordersSuccessfully)
