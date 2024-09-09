// ** Elysia Imports

import { Elysia } from 'elysia'

// ** Models Imports
import { productBrandModels } from './product-brand.model'

// ** Service Imports
import { ProductBrandService } from './product-brand.service'

export const productBrandController = new Elysia({ prefix: '/product-brands' })
    .decorate({
        ProductBrandService: new ProductBrandService()
    })

    .use(productBrandModels)
    .get('/', ({ ProductBrandService, query }) => ProductBrandService.getTableList(query), {
        query: 'productBrandSearch'
    })
    .get('/:id', ({ ProductBrandService, params, redis }) => ProductBrandService.retrieve(params.id, redis))
    .get('data-list-category/:id', ({ ProductBrandService, params, redis }) =>
        ProductBrandService.getDataListCategory(params.id, redis)
    )
    .post('/', ({ ProductBrandService, body, redis }) => ProductBrandService.create(body, redis), {
        body: 'productBrand'
    })
    .patch(
        '/:id',
        ({ ProductBrandService, body, params, redis }) => ProductBrandService.update(params.id, body, redis),
        {
            body: 'productBrand'
        }
    )
    .delete(
        '/:id',
        ({ ProductBrandService, query, params, redis }) => ProductBrandService.delete(params.id, query, redis),
        {
            query: 'productBrandDelete'
        }
    )
