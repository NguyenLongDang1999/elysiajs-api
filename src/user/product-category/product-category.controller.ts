// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
import { productCategoryModels } from './product-category.model'

// ** Service Imports
import { ProductCategoryService } from './product-category.service'

export const productCategoryController = new Elysia({ prefix: '/product-category' })
    .decorate({
        UserProductCategoryService: new ProductCategoryService()
    })
    .use(redis())
    .use(productCategoryModels)
    .get('data-list-nested', ({ UserProductCategoryService, redis }) => UserProductCategoryService.getNestedList(redis))
    .get('data-list-shop', ({ UserProductCategoryService, query, redis }) => UserProductCategoryService.getDataListShop(query, redis), {
        query: 'userProductCategorySearch'
    })
    .get('/:slug', ({ UserProductCategoryService, params, query, redis }) => UserProductCategoryService.retrieve(params.slug, query, redis), {
        query: 'userProductCategorySearch'
    })
