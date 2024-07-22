// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Definition
export const paginationType = {
    page: t
        .Transform(t.Optional(t.String()))
        .Decode((value) => parseInt(value))
        .Encode((value) => value.toString()),
    pageSize: t
        .Transform(t.Optional(t.String()))
        .Decode((value) => parseInt(value))
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
