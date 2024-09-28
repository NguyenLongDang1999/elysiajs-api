// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { WishlistModels } from './wishlist.model'

// ** Service Imports
import { WishlistService } from './wishlist.service'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'
import { redisPlugin } from '../plugins/redis'

export const wishlistController = new Elysia({ prefix: '/wishlist' })
    .decorate({
        UserWishlistService: new WishlistService()
    })
    .use(WishlistModels)
    .use(redisPlugin)
    .use(authUserPlugin)
    .get('/', ({ UserWishlistService, user, error }) => {
        if (!user || !user.id) throw error('Not Found')

        return UserWishlistService.getList(user.id)
    })
    .post(
        '/',
        ({ UserWishlistService, user, error, redis, body }) => {
            if (!user || !user.id) throw error('Not Found')

            return UserWishlistService.create(user.id, redis, body)
        },
        { body: 'wishlist' }
    )
    .delete(
        '/:id',
        ({ UserWishlistService, user, error, redis, params }) => {
            if (!user || !user.id) throw error('Not Found')

            return UserWishlistService.delete(user.id, redis, params)
        },
        {
            params: 'deleteWishlist'
        }
    )
