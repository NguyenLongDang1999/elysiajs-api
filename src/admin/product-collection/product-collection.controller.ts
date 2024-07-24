// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
import { productCollectionModels } from './product-collection.model'

// ** Service Imports
import { ProductCollectionService } from './product-collection.service'

export const productCollectionController = new Elysia({ prefix: '/product-collections' })
    .decorate({
        ProductCollectionService: new ProductCollectionService()
    })
    .use(redis())
    .use(productCollectionModels)
    .get('/', ({ ProductCollectionService, query }) => ProductCollectionService.getTableList(query), {
        query: 'productCollectionSearch'
    })
    .get('data-list', ({ ProductCollectionService, redis }) => ProductCollectionService.getDataList(redis))
    .get('/:id', ({ ProductCollectionService, params, redis }) => ProductCollectionService.retrieve(params.id, redis))
    .post('/', ({ ProductCollectionService, body, redis }) => ProductCollectionService.create(body, redis), {
        body: 'productCollection'
    })
    .patch(
        '/:id',
        ({ ProductCollectionService, body, params, redis }) => ProductCollectionService.update(params.id, body, redis),
        {
            body: 'productCollection'
        }
    )
    .delete(
        '/:id',
        ({ ProductCollectionService, query, params, redis }) =>
            ProductCollectionService.delete(params.id, query, redis),
        {
            query: 'productCollectionDelete'
        }
    )
