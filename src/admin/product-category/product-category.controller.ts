// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productCategoryModels } from './product-category.model'

// ** Service Imports
import { ProductCategoryService } from './product-category.service'

// ** Plugins Imports
import { redisPlugin } from '../plugins/redis'

export const productCategoryController = new Elysia({ prefix: '/product-categories' })
    .decorate({
        ProductCategoryService: new ProductCategoryService()
    })
    .use(redisPlugin)
    .use(productCategoryModels)
    .get('/', ({ ProductCategoryService, query }) => ProductCategoryService.getTableList(query), {
        query: 'productCategorySearch'
    })
    .get('data-list', ({ ProductCategoryService, adminRedis }) => ProductCategoryService.getDataList(adminRedis))
    .get('/:id', ({ ProductCategoryService, params, adminRedis }) => ProductCategoryService.retrieve(params.id, adminRedis))
    .post('/', ({ ProductCategoryService, body, adminRedis }) => ProductCategoryService.create(body, adminRedis), {
        body: 'productCategory'
    })
    .patch(
        '/:id',
        ({ ProductCategoryService, body, params, adminRedis }) => ProductCategoryService.update(params.id, body, adminRedis),
        {
            body: 'productCategory'
        }
    )
    .delete(
        '/:id',
        ({ ProductCategoryService, query, params, adminRedis }) => ProductCategoryService.delete(params.id, query, adminRedis),
        {
            query: 'productCategoryDelete'
        }
    )
