// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const ordersType = t.Object({
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    parent_id: t.Optional(t.String()),
    image_uri: t.Optional(t.String()),
    description: t.Optional(t.String()),
    status: t.Optional(t.Number()),
    meta_title: t.Optional(t.String()),
    meta_description: t.Optional(t.String())
})

export const ordersSearchType = t.Object({
    ...paginationType,
    name: t.Optional(t.String()),
    email: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value)
})

export const orderUpdateStatusType = t.Object({
    id: t.Optional(t.String()),
    status: t.Optional(t.Number())
})

// ** Types
export type IOrdersDTO = Static<typeof ordersType>

export type IOrdersSearchDTO = Static<typeof ordersSearchType>
