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
    .get('/data-list', async ({ UserCartService, user, cookie }) => {
        console.log(cookie.session_id.value)
        return UserCartService.getDataList(cookie, user?.id)
    })
    .post('/', async ({ UserCartService, user, body, cookie }) => UserCartService.create(cookie, body, user?.id), {
        body: 'cart'
    })
    .patch('/', async ({ UserCartService, body }) => UserCartService.update(body), {
        body: 'cartUpdate'
    })
    .delete('/:id', async ({ UserCartService, params, query }) => UserCartService.delete(params.id, query), {
        query: 'cartDelete'
    })
