// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
import { productCategoryModels } from './product-category.model'

// ** Service Imports
import { ProductCategoryService } from './product-category.service'

export const productCategoryController = new Elysia({ prefix: '/product-categories' })
    .decorate({
        ProductCategoryService: new ProductCategoryService()
    })
    .use(redis())
    .use(productCategoryModels)
    .get('/', ({ ProductCategoryService, query }) => ProductCategoryService.getTableList(query), {
        query: 'productCategorySearch'
    })
    .get('data-list', ({ ProductCategoryService, redis }) => ProductCategoryService.getDataList(redis))
    .get('/:id', ({ ProductCategoryService, params, redis }) => ProductCategoryService.retrieve(params.id, redis))
    .post('/', ({ ProductCategoryService, body, redis }) => ProductCategoryService.create(body, redis), {
        body: 'productCategory'
    })
    .patch(
        '/:id',
        ({ ProductCategoryService, body, params, redis }) => ProductCategoryService.update(params.id, body, redis),
        {
            body: 'productCategory'
        }
    )
    .delete(
        '/:id',
        ({ ProductCategoryService, query, params, redis }) => ProductCategoryService.delete(params.id, query, redis),
        {
            query: 'productCategoryDelete'
        }
    )
