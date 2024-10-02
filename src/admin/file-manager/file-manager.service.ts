// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { FileManagerModels } from './file-manager.model'

// ** Class Imports
import { FileManagerClass } from './file-manager.class'

export const fileManagerTableList = new Elysia()
    .decorate({
        FileManagerClass: new FileManagerClass()
    })
    .use(FileManagerModels)
    .get(
        '/',
        async ({ FileManagerClass, query }) => {
            try {
                const storageName = Bun.env.BUNNY_STORAGE_NAME

                const pathName = FileManagerClass.buildPath(query.path)
                const url = `${await FileManagerClass.getBaseUrl()}${storageName}/${pathName}/`

                return FileManagerClass.sendRequest('get', url)
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            query: 'fileManagerSearch'
        }
    )

export const fileManagerCreate = new Elysia()
    .decorate({
        FileManagerClass: new FileManagerClass()
    })
    .use(FileManagerModels)
    .post(
        '/',
        async ({ FileManagerClass, body, query }) => {
            try {
                const storageName = Bun.env.BUNNY_STORAGE_NAME

                const pathName = FileManagerClass.buildPath(query.path, body.folder_name + '/')
                const url = `${await FileManagerClass.getBaseUrl()}${storageName}/${pathName}`

                return FileManagerClass.sendRequest('put', url)
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'fileManager',
            query: 'fileManagerSearch'
        }
    )

export const fileManagerUploadFile = new Elysia()
    .decorate({
        FileManagerClass: new FileManagerClass()
    })
    .use(FileManagerModels)
    .put(
        '/',
        async ({ FileManagerClass, body, query }) => {
            try {
                const storageName = Bun.env.BUNNY_STORAGE_NAME

                const pathName = FileManagerClass.buildPath(query.path, body.file.name)
                const url = `${await FileManagerClass.getBaseUrl()}${storageName}/${pathName}`
                const buffer = await body.file.arrayBuffer()

                return FileManagerClass.sendRequest('put', url, buffer)
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'fileManagerUpload',
            query: 'fileManagerSearch'
        }
    )

export const fileManagerDelete = new Elysia()
    .decorate({
        FileManagerClass: new FileManagerClass()
    })
    .use(FileManagerModels)
    .delete(
        '/',
        async ({ FileManagerClass, body, query }) => {
            try {
                const storageName = Bun.env.BUNNY_STORAGE_NAME

                const pathName = FileManagerClass.buildPath(query.path, body.folder_name + (body.is_folder ? '/' : ''))
                const url = `${await FileManagerClass.getBaseUrl()}${storageName}/${pathName}`

                return FileManagerClass.sendRequest('delete', url)
            } catch (error) {
                handleDatabaseError(error)
            }
        },
        {
            body: 'fileManager',
            query: 'fileManagerSearch'
        }
    )
