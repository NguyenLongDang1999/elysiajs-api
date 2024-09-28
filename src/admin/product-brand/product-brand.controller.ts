// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productBrandModels } from './product-brand.model'

// ** Service Imports
import { ProductBrandService } from './product-brand.service'

// ** Plugins Imports
import { redisPlugin } from '../plugins/redis'

export const productBrandController = new Elysia({ prefix: '/product-brands' })
    .decorate({
        ProductBrandService: new ProductBrandService()
    })
    .use(redisPlugin)
    .use(productBrandModels)
    .get('/', ({ ProductBrandService, query }) => ProductBrandService.getTableList(query), {
        query: 'productBrandSearch'
    })
    .get('/:id', ({ ProductBrandService, params, adminRedis }) => ProductBrandService.retrieve(params.id, adminRedis))
    .get('data-list-category/:id', ({ ProductBrandService, params, adminRedis }) =>
        ProductBrandService.getDataListCategory(params.id, adminRedis)
    )
    .post('/', ({ ProductBrandService, body, adminRedis }) => ProductBrandService.create(body, adminRedis), {
        body: 'productBrand'
    })
    .patch(
        '/:id',
        ({ ProductBrandService, body, params, adminRedis }) => ProductBrandService.update(params.id, body, adminRedis),
        {
            body: 'productBrand'
        }
    )
    .delete(
        '/:id',
        ({ ProductBrandService, query, params, adminRedis }) => ProductBrandService.delete(params.id, query, adminRedis),
        {
            query: 'productBrandDelete'
        }
    )
