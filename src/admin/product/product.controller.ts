// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productCreateSingle,
    productCreateVariants,
    productDelete,
    productRetrieve,
    productTableList,
    productUpdateGeneralVariants,
    productUpdateImages,
    productUpdateRelations,
    productUpdateSingle
} from './product.service'

export const productController = new Elysia({ prefix: '/product' })
    .use(productTableList)
    .use(productRetrieve)
    .use(productCreateSingle)
    .use(productCreateVariants)
    .use(productUpdateGeneralVariants)
    .use(productUpdateImages)
    .use(productUpdateRelations)
    .use(productUpdateSingle)
    .use(productDelete)
