// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Definition
export const paginationType = {
    page: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.Number())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value.toString()),
    pageSize: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.Number())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value.toString())
}

export const paginationObjectType = t.Object({
    ...paginationType
})

export const deleteType = t.Object({
    force: t.Optional(t.String()),
    slug: t.Optional(t.String())
})

export type IDeleteDTO = Static<typeof deleteType>
