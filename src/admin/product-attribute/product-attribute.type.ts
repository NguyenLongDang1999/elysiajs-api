// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productAttributeType = t.Object({
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    product_category_id: t.Array(t.String(), {
        minItems: 1
    }),
    product_attribute_values: t.Array(
        t.Object({
            id: t.Optional(t.String()),
            value: t.String()
        }),
        { minItems: 1 }
    ),
    description: t.Optional(t.String()),
    status: t.Optional(t.Number())
})

export const productAttributeSearchType = t.Object({
    ...paginationType,
    name: t.Optional(t.String()),
    product_category_id: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value)
})

// ** Types
export type IProductAttributeDTO = Static<typeof productAttributeType>

export type IProductAttributeSearchDTO = Static<typeof productAttributeSearchType>
