// ** Elysia Imports
import { paginationType } from '@src/types/core.type'
import {
    Static,
    t
} from 'elysia'

// ** Types Definition
export const productCategory = {
    id: t.String(),
    name: t.String(),
    slug: t.String(),
    image_uri: t.Nullable(t.String()),
    parent_id: t.Nullable(t.String())
}

export const productCategoryNestedList = t.Object({
    ...productCategory,
    children: t.Optional(t.Array(t.Object(productCategory)))
})

export const sortType = t.Union([
    t.Literal('created_at-desc'),
    t.Literal('created_at-asc'),
    t.Literal('name-desc'),
    t.Literal('name-asc'),
    t.Literal('price-asc'),
    t.Literal('price-desc')
])

export const productCategorySearchType = t.Object({
    ...paginationType,
    sort: t.Optional(sortType),
    productBrands: t.Optional(t.Union([t.Array(t.String()), t.String()])),
    productRating: t.Optional(t.Union([t.Array(t.String()), t.String()])),
    productAttributes: t.Optional(t.Union([t.Array(t.String()), t.String()]))
})

// ** Types
export type IProductCategoryNestedListDTO = Static<typeof productCategoryNestedList>

export type IProductCategorySearchDTO = Static<typeof productCategorySearchType>

export type ISortDTO = Static<typeof sortType>
