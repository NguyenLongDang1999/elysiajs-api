// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
// import { productCategoryModels } from './product-category.model'

// ** Service Imports
import { ProductCategoryService } from './product-category.service'

export const productCategoryController = new Elysia({ prefix: '/product-category' })
    .decorate({
        UserProductCategoryService: new ProductCategoryService()
    })
    .use(redis())
    .get('data-list-nested', ({ UserProductCategoryService, redis }) => UserProductCategoryService.getNestedList(redis))
