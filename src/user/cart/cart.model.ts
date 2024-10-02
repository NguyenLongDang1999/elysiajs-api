// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import {
    cartDeleteType,
    cartType,
    cartUpdateType
} from './cart.type'

export const CartModels = new Elysia().model({
    cart: cartType,
    cartUpdate: cartUpdateType,
    cartDelete: cartDeleteType
})
