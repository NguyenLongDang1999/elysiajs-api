// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productInventoryModels } from './product-inventory.model'

// ** Service Imports
import { ProductInventoryService } from './product-inventory.service'

export const productInventoryController = new Elysia({ prefix: '/product-collections' })
    .decorate({
        ProductInventoryService: new ProductInventoryService()
    })
    .use(productInventoryModels)
    .get('/', ({ ProductInventoryService, query }) => ProductInventoryService.getTableList(query), {
        query: 'productInventorySearch'
    })
    .post('/', ({ ProductInventoryService, body }) => ProductInventoryService.create(body), {
        body: 'productInventory'
    })
