// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { fileManagerSearchType, fileManagerType, fileManagerUploadType } from './file-manager.type'

export const FileManagerModels = new Elysia().model({
    fileManager: fileManagerType,
    fileManagerUpload: fileManagerUploadType,
    fileManagerSearch: fileManagerSearchType
})
