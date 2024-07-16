// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import { productBrandSearchType, productBrandType } from './product-brand.type'

export const productBrandModels = new Elysia().model({
    productBrand: productBrandType,
    productBrandSearch: productBrandSearchType,
    productBrandDelete: deleteType
})
