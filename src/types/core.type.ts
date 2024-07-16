// ** Elysia Imports
import { t, Static } from 'elysia'

// ** Types Definition
export const paginationType = {
    page: t.Optional(t.Number()),
    pageSize: t.Optional(t.Number())
}

export const deleteType = t.Object({
    force: t.Optional(t.String()),
    slug: t.Optional(t.String())
})

export type IDeleteDTO = Static<typeof deleteType>
