// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
import { productFlashDealsModels } from './product-flash-deals.model'

// ** Service Imports
import { ProductFlashDealsService } from './product-flash-deals.service'

export const productFlashDealsController = new Elysia({ prefix: '/product-flash-deals' })
    .decorate({
        ProductFlashDealsService: new ProductFlashDealsService()
    })
    .use(redis())
    .use(productFlashDealsModels)
    .get('/', ({ ProductFlashDealsService, query }) => ProductFlashDealsService.getTableList(query), {
        query: 'productFlashDealsSearch'
    })
    .get('data-list', ({ ProductFlashDealsService, redis }) => ProductFlashDealsService.getDataList(redis))
    .get('/:id', ({ ProductFlashDealsService, params, redis }) => ProductFlashDealsService.retrieve(params.id, redis))
    .post('/', ({ ProductFlashDealsService, body, redis }) => ProductFlashDealsService.create(body, redis), {
        body: 'productFlashDeals'
    })
    .patch(
        '/:id',
        ({ ProductFlashDealsService, body, params, redis }) => ProductFlashDealsService.update(params.id, body, redis),
        {
            body: 'productFlashDeals'
        }
    )
    .delete(
        '/:id',
        ({ ProductFlashDealsService, query, params, redis }) =>
            ProductFlashDealsService.delete(params.id, query, redis),
        {
            query: 'productFlashDealsDelete'
        }
    )
