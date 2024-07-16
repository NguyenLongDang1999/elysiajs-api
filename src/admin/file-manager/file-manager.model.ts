// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { fileManagerSearchType } from './file-manager.type'

export const FileManagerModels = new Elysia().model({
    fileManagerSearch: fileManagerSearchType,
})
