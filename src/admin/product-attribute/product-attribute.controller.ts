// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productAttributeModels } from './product-attribute.model'

// ** Service Imports
import { ProductAttributeService } from './product-attribute.service'

export const productAttributeController = new Elysia({ prefix: '/product-attributes' })
    .decorate({
        ProductAttributeService: new ProductAttributeService()
    })
    .use(productAttributeModels)
    .get('/', ({ ProductAttributeService, query }) => ProductAttributeService.getTableList(query), {
        query: 'productAttributeSearch'
    })
    .get('/:id', ({ ProductAttributeService, params }) => ProductAttributeService.retrieve(params.id))
    .get('data-list-category/:id', ({ ProductAttributeService, params }) =>
        ProductAttributeService.getDataListCategory(params.id)
    )
    .get('attribute-value-data-list/:id', ({ ProductAttributeService, params }) =>
        ProductAttributeService.getValueDataList(params.id)
    )
    .post('/', ({ ProductAttributeService, body }) => ProductAttributeService.create(body), {
        body: 'productAttribute'
    })
    .patch('/:id', ({ ProductAttributeService, body, params }) => ProductAttributeService.update(params.id, body), {
        body: 'productAttribute'
    })
    .delete('/:id', ({ ProductAttributeService, query, params }) => ProductAttributeService.delete(params.id, query), {
        query: 'productAttributeDelete'
    })
