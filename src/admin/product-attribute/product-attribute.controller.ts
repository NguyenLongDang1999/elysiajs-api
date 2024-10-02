// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productAttributeCreate,
    productAttributeDataListAttributeValue,
    productAttributeDataListCategory,
    productAttributeDelete,
    productAttributeRetrieve,
    productAttributeTableList,
    productAttributeUpdate
} from './product-attribute.service'

export const productAttributeController = new Elysia({ prefix: '/product-attributes' })
    .use(productAttributeCreate)
    .use(productAttributeDelete)
    .use(productAttributeUpdate)
    .use(productAttributeRetrieve)
    .use(productAttributeTableList)
    .use(productAttributeDataListCategory)
    .use(productAttributeDataListAttributeValue)
