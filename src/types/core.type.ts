// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Definition
export const paginationType = {
    page: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value),
    pageSize: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value)
}

export const paginationObjectType = t.Object({
    ...paginationType
})

export const deleteType = t.Object({
    force: t.Optional(t.String()),
    slug: t.Optional(t.String())
})

export type IDeleteDTO = Static<typeof deleteType>
