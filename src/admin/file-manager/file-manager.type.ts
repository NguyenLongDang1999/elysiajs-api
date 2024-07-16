// ** Elysia Imports
import { t, Static } from 'elysia'

// ** Types Definition
export const fileManagerType = t.Object({
    folder_name: t.String({ minLength: 1 }),
    is_folder: t.Optional(t.Boolean()),
})

export const fileManagerSearchType = t.Object({
    path: t.String({ minLength: 1 }),
})

// ** Types
export type IFileManagerDTO = Static<typeof fileManagerType>

export type IFileManagerSearchDTO = Static<typeof fileManagerSearchType>
