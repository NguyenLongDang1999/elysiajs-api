// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productCollectionModels } from './product-collection.model'

// ** Service Imports
import { ProductCollectionService } from './product-collection.service'

// ** Plugins Imports
import { redisPlugin } from '../plugins/redis'

export const productCollectionController = new Elysia({ prefix: '/product-collections' })
    .decorate({
        ProductCollectionService: new ProductCollectionService()
    })
    .use(redisPlugin)
    .use(productCollectionModels)
    .get('/', ({ ProductCollectionService, query }) => ProductCollectionService.getTableList(query), {
        query: 'productCollectionSearch'
    })
    .get('data-list', ({ ProductCollectionService, adminRedis }) => ProductCollectionService.getDataList(adminRedis))
    .get('/:id', ({ ProductCollectionService, params, adminRedis }) => ProductCollectionService.retrieve(params.id, adminRedis))
    .post('/', ({ ProductCollectionService, body, adminRedis }) => ProductCollectionService.create(body, adminRedis), {
        body: 'productCollection'
    })
    .patch(
        '/:id',
        ({ ProductCollectionService, body, params, adminRedis }) => ProductCollectionService.update(params.id, body, adminRedis),
        {
            body: 'productCollection'
        }
    )
    .delete(
        '/:id',
        ({ ProductCollectionService, query, params, adminRedis }) =>
            ProductCollectionService.delete(params.id, query, adminRedis),
        {
            query: 'productCollectionDelete'
        }
    )
