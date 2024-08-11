// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import {
    generateVariantType,
    productImagesType,
    productRelationsType,
    productSearchType,
    productSingleType,
    productUpdateGeneralVariantsType,
    productVariantsType
} from './product.type'

export const productModels = new Elysia().model({
    productSearch: productSearchType,
    productDelete: deleteType,
    generateVariant: generateVariantType,
    productRelations: productRelationsType,
    productImages: productImagesType,
    productSingle: productSingleType,
    productVariants: productVariantsType,
    productUpdateGeneralVariants: productUpdateGeneralVariantsType
})
