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
    .get('data-list', ({ ProductBrandService }) => ProductBrandService.getDataList())
    .get('/:id', ({ ProductBrandService, params }) => ProductBrandService.retrieve(params.id))
    .post('/', ({ ProductBrandService, body }) => ProductBrandService.create(body), { body: 'productBrand' })
    .patch('/:id', ({ ProductBrandService, body, params }) => ProductBrandService.update(params.id, body), {
        body: 'productBrand'
    })
    .delete('/:id', ({ ProductBrandService, query, params }) => ProductBrandService.delete(params.id, query), {
        query: 'productBrandDelete'
    })
