// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { CartModels } from './cart.model'

// ** Service Imports
import { CartService } from './cart.service'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'

export const cartController = new Elysia({ prefix: '/cart' })
    .decorate({
        UserCartService: new CartService()
    })
    .use(CartModels)
    .use(authUserPlugin)
    .post('/', async ({ UserCartService, user, body, cookie }) => UserCartService.create(cookie, body, user?.id), {
        body: 'cart'
    })
