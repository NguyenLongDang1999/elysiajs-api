// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    fileManagerCreate,
    fileManagerDelete,
    fileManagerTableList,
    fileManagerUploadFile
} from './file-manager.service'

export const fileManagerController = new Elysia({ prefix: '/file-manager' })
    .use(fileManagerCreate)
    .use(fileManagerDelete)
    .use(fileManagerTableList)
    .use(fileManagerUploadFile)
