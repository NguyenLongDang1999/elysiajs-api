// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteWishlistType, wishlistType } from './wishlist.type'

export const WishlistModels = new Elysia().model({
    wishlist: wishlistType,
    deleteWishlist: deleteWishlistType
})
