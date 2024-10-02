// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { productCategoryRetrieve } from './product.service'

export const productController = new Elysia({ prefix: '/product' })
    .use(productCategoryRetrieve)
