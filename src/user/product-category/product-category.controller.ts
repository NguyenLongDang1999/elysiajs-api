// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productCategoryDataListShop,
    productCategoryNestedList,
    productCategoryRetrieve
} from './product-category.service'

export const productCategoryController = new Elysia({ prefix: '/product-category' })
    .use(productCategoryRetrieve)
    .use(productCategoryNestedList)
    .use(productCategoryDataListShop)
