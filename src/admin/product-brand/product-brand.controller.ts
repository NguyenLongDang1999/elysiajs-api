// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productBrandCreate,
    productBrandDataListCategory,
    productBrandDelete,
    productBrandRetrieve,
    productBrandTableList,
    productBrandUpdate
} from './product-brand.service'

export const productBrandController = new Elysia({ prefix: '/product-brands' })
    .use(productBrandCreate)
    .use(productBrandDelete)
    .use(productBrandUpdate)
    .use(productBrandRetrieve)
    .use(productBrandTableList)
    .use(productBrandDataListCategory)
