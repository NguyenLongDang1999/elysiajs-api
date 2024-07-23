// ** Elysia Imports
import { StaticDecode } from '@sinclair/typebox'
import { Static, t } from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productBrandType = t.Object({
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    product_category_id: t.Array(t.String(), {
        minItems: 1
    }),
    image_uri: t.Optional(t.String()),
    description: t.Optional(t.String()),
    status: t.Optional(t.Number())
})

export const productBrandSearchType = t.Object({
    ...paginationType,
    name: t.Optional(t.String()),
    product_category_id: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.Number())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value.toString())
})

// ** Types
export type IProductBrandDTO = Static<typeof productBrandType>

export type IProductBrandSearchDTO = StaticDecode<typeof productBrandSearchType>
