// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { createOrdersType } from './orders.type'

export const orderModels = new Elysia().model({
    createOrders: createOrdersType
})
