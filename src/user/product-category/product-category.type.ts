// ** Elysia Imports
import { paginationType } from '@src/types/core.type'
import { Static, t } from 'elysia'

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
    children: t.Array(t.Object(productCategory))
})

export const productCategorySearchType = t.Object({
    ...paginationType,
    sort: t.Optional(t.String()),
    productBrands: t.Optional(t.Union([t.Array(t.String()), t.String()])),
    productRating: t.Optional(t.Union([t.Array(t.String()), t.String()])),
    productAttributes: t.Optional(t.Union([t.Array(t.String()), t.String()]))
})

// ** Types
export type IProductCategoryNestedListDTO = Static<typeof productCategoryNestedList>

export type IProductCategorySearchDTO = Static<typeof productCategorySearchType>
