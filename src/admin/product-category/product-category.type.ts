// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productCategoryType = t.Object({
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    parent_id: t.Optional(t.String()),
    image_uri: t.Optional(t.String()),
    description: t.Optional(t.String()),
    status: t.Optional(t.Number()),
    meta_title: t.Optional(t.String()),
    meta_description: t.Optional(t.String())
})

export const productCategorySearchType = t.Object({
    ...paginationType,
    name: t.Optional(t.String()),
    parent_id: t.Optional(t.String()),
    product_brand_id: t.Optional(t.String()),
    product_attribute_id: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value)
})

// ** Types
export type IProductCategoryDTO = Static<typeof productCategoryType>

export type IProductCategorySearchDTO = Static<typeof productCategorySearchType>
