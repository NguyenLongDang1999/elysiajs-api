// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import {
    productCollectionSearchType,
    productCollectionType
} from './product-collection.type'

export const productCollectionModels = new Elysia().model({
    productCollection: productCollectionType,
    productCollectionSearch: productCollectionSearchType,
    productCollectionDelete: deleteType
})
