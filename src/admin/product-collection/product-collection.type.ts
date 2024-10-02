// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productCollectionType = t.Object({
    title: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    status: t.Optional(t.Number()),
    product_id: t.Array(t.String(), {
        minItems: 1
    })
})

export const productCollectionSearchType = t.Object({
    ...paginationType,
    title: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value)
})

// ** Types
export type IProductCollectionDTO = Static<typeof productCollectionType>

export type IProductCollectionSearchDTO = Static<typeof productCollectionSearchType>
