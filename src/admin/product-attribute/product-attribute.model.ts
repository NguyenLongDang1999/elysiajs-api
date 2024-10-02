// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import {
    productAttributeSearchType,
    productAttributeType
} from './product-attribute.type'

export const productAttributeModels = new Elysia().model({
    productAttribute: productAttributeType,
    productAttributeSearch: productAttributeSearchType,
    productAttributeDelete: deleteType
})
