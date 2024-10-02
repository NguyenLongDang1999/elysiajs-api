// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productCategoryCreate,
    productCategoryDataList,
    productCategoryDelete,
    productCategoryRetrieve,
    productCategoryTableList,
    productCategoryUpdate
} from './product-category.service'

export const productCategoryController = new Elysia({ prefix: '/product-categories' })
    .use(productCategoryCreate)
    .use(productCategoryDelete)
    .use(productCategoryUpdate)
    .use(productCategoryRetrieve)
    .use(productCategoryDataList)
    .use(productCategoryTableList)
