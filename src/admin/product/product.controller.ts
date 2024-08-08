// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productModels } from './product.model'

// ** Service Imports
import { ProductService } from './product.service'

export const productController = new Elysia({ prefix: '/product' })
    .decorate({
        ProductService: new ProductService()
    })
    .use(productModels)
    .get('/', ({ ProductService, query }) => ProductService.getTableList(query), {
        query: 'productSearch'
    })
    .get('/:id', ({ ProductService, params }) => ProductService.retrieve(params.id))
    .post('/', ({ ProductService, body }) => ProductService.create(body), {
        body: 'product'
    })
    .post('generate-variant', ({ ProductService, body }) => ProductService.generateVariant(body), {
        body: 'generateVariant'
    })
    .patch('/:id/relations', ({ ProductService, params, body }) => ProductService.updateRelations(params.id, body), {
        body: 'productRelations'
    })
    .patch('/:id/images', ({ ProductService, body, params }) => ProductService.updateImages(params.id, body), {
        body: 'productImages'
    })
// .delete('/:id', ({ ProductService, query, params }) => ProductService.delete(params.id, query), {
//     query: 'productDelete'
// })
