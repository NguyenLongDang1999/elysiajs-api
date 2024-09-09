// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { ProductService } from './product.service'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'

export const productController = new Elysia({ prefix: '/product' })
    .decorate({
        UserProductService: new ProductService()
    })
    .use(authUserPlugin)
    .get('/:slug', ({ UserProductService, params, redis, user }) => UserProductService.retrieve(params.slug, redis, user?.id))
