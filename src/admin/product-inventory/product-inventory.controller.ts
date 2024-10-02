// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productInventoryCreate,
    productInventoryTableList
} from './product-inventory.service'

export const productInventoryController = new Elysia({ prefix: '/product-inventory' })
    .use(productInventoryCreate)
    .use(productInventoryTableList)
