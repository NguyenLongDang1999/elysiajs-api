// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Definition
export const wishlistType = t.Object({
    product_id: t.String()
})

export const deleteWishlistType = t.Object({
    id: t.String()
})

// ** Types
export type IWishlistDTO = Static<typeof wishlistType>

export type IDeleteWishlistDTO = Static<typeof deleteWishlistType>
