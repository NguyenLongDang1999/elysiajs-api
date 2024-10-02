// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import {
    productCategorySearchType,
    productCategoryType
} from './product-category.type'

export const productCategoryModels = new Elysia().model({
    productCategory: productCategoryType,
    productCategorySearch: productCategorySearchType,
    productCategoryDelete: deleteType
})
