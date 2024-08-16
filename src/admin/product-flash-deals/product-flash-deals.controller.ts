// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productFlashDealsModels } from './product-flash-deals.model'

// ** Service Imports
import { ProductFlashDealsService } from './product-flash-deals.service'

export const productFlashDealsController = new Elysia({ prefix: '/product-flash-deals' })
    .decorate({
        ProductFlashDealsService: new ProductFlashDealsService()
    })
    .use(productFlashDealsModels)
    .get('/', ({ ProductFlashDealsService, query }) => ProductFlashDealsService.getTableList(query), {
        query: 'productFlashDealsSearch'
    })
    .get('data-list', ({ ProductFlashDealsService }) => ProductFlashDealsService.getDataList())
    .get('/:id', ({ ProductFlashDealsService, params }) => ProductFlashDealsService.retrieve(params.id))
    .post('/', ({ ProductFlashDealsService, body }) => ProductFlashDealsService.create(body), {
        body: 'productFlashDeals'
    })
    .patch('/:id', ({ ProductFlashDealsService, body, params }) => ProductFlashDealsService.update(params.id, body), {
        body: 'productFlashDeals'
    })
    .delete(
        '/:id',
        ({ ProductFlashDealsService, query, params }) => ProductFlashDealsService.delete(params.id, query),
        {
            query: 'productFlashDealsDelete'
        }
    )
