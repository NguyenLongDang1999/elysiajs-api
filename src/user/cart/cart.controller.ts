// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    cartCreate,
    cartDataList,
    cartDelete,
    cartUpdate
} from './cart.service'

export const cartController = new Elysia({ prefix: '/cart' })
    .use(cartCreate)
    .use(cartUpdate)
    .use(cartDelete)
    .use(cartDataList)
