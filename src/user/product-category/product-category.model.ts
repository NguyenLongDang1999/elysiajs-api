// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { productCategorySearchType } from './product-category.type'

export const productCategoryModels = new Elysia().model({
    userProductCategorySearch: productCategorySearchType
})
