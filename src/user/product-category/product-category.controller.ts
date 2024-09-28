// ** Elysia Imports

import { Elysia } from 'elysia'

// ** Models Imports
import { productCategoryModels } from './product-category.model'

// ** Service Imports
import { ProductCategoryService } from './product-category.service'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'
import { redisPlugin } from '../plugins/redis'

export const productCategoryController = new Elysia({ prefix: '/product-category' })
    .decorate({
        UserProductCategoryService: new ProductCategoryService()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .use(productCategoryModels)
    .get('data-list-nested', ({ UserProductCategoryService, redis }) => UserProductCategoryService.getNestedList(redis))
    .get(
        'data-list-shop',
        ({ UserProductCategoryService, query, redis, user }) =>
            UserProductCategoryService.getDataListShop(query, redis, user?.id),
        {
            query: 'userProductCategorySearch'
        }
    )
    .get(
        '/:slug',
        ({ UserProductCategoryService, params, query, redis, user }) =>
            UserProductCategoryService.retrieve(params.slug, query, redis, user?.id),
        {
            query: 'userProductCategorySearch'
        }
    )
