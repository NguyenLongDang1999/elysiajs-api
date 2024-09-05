// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { cartType } from './cart.type'

export const CartModels = new Elysia().model({
    cart: cartType
})
