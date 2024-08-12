// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { productInventorySearchType, productInventoryType } from './product-inventory.type'

export const productInventoryModels = new Elysia().model({
    productInventory: productInventoryType,
    productInventorySearch: productInventorySearchType
})
