// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productFlashDealsType = t.Object({
    title: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    status: t.Optional(t.Number()),
    product_id: t.Array(t.String(), {
        minItems: 1
    }),
    description: t.Optional(t.String()),
    start_time: t.Date(),
    end_time: t.Date(),
    discounted_price: t.Number({ default: 0 }),
    discounted_price_type: t.Number()
})

export const productFlashDealsSearchType = t.Object({
    ...paginationType,
    title: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value)
})

// ** Types
export type IProductFlashDealsDTO = Static<typeof productFlashDealsType>

export type IProductFlashDealsSearchDTO = Static<typeof productFlashDealsSearchType>
