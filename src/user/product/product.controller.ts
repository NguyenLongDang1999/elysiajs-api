// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
// import { productCategoryModels } from './product-category.model'

// ** Service Imports
import { ProductService } from './product.service'

export const productController = new Elysia({ prefix: '/product' })
    .decorate({
        UserProductService: new ProductService()
    })
    .use(redis())
    .get('/:slug', ({ UserProductService, params, redis }) => UserProductService.retrieve(params.slug, redis))
