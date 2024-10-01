// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { ProductCategoryService } from '../product-category/product-category.service'
import { ProductService } from './product.service'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'
import { redisPlugin } from '../plugins/redis'

export const productController = new Elysia({ prefix: '/product' })
    .decorate({
        UserProductService: new ProductService(),
        UserProductCategoryService: new ProductCategoryService()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .get('/:slug', ({ UserProductService, UserProductCategoryService, params, redis, user }) =>
        UserProductService.retrieve(UserProductCategoryService, params.slug, redis, user?.id)
    )
