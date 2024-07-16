// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productCategoryModels } from './product-category.model'

// ** Service Imports
import { ProductCategoryService } from './product-category.service'

// ** Plugins Imports
import { authPlugin } from '../plugins/auth'

export const productCategoryController = new Elysia({ prefix: '/product-categories' })
    .decorate({
        ProductCategoryService: new ProductCategoryService()
    })
    .use(authPlugin)
    .use(productCategoryModels)
    .get('/', ({ ProductCategoryService, query }) => ProductCategoryService.getTableList(query), {
        query: 'productCategorySearch'
    })
    .get('data-list', ({ ProductCategoryService }) => ProductCategoryService.getDataList())
    .get('/:id', ({ ProductCategoryService, params }) => ProductCategoryService.retrieve(params.id))
    .post('/', ({ ProductCategoryService, body }) => ProductCategoryService.create(body), { body: 'productCategory' })
    .patch('/:id', ({ ProductCategoryService, body, params }) => ProductCategoryService.update(params.id, body), {
        body: 'productCategory'
    })
    .delete('/:id', ({ ProductCategoryService, query, params }) => ProductCategoryService.delete(params.id, query), {
        query: 'productCategoryDelete'
    })
