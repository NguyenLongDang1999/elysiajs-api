// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import { generateVariantType, productRelationsType, productSearchType, productType } from './product.type'

export const productModels = new Elysia().model({
    product: productType,
    productSearch: productSearchType,
    productDelete: deleteType,
    generateVariant: generateVariantType,
    productRelations: productRelationsType
})
