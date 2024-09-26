// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Definition
export const fileManagerType = t.Object({
    folder_name: t.String({ minLength: 1 }),
    is_folder: t.Optional(t.Boolean())
})

export const fileManagerUploadType = t.Object({
    file: t.File()
})

export const fileManagerSearchType = t.Object({
    path: t.Optional(t.String())
})

// ** Types
export type IFileManagerDTO = Static<typeof fileManagerType>

export type IFileManagerUploadDTO = Static<typeof fileManagerUploadType>

export type IFileManagerSearchDTO = Static<typeof fileManagerSearchType>
