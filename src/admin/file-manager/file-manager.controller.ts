// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { FileManagerModels } from './file-manager.model'

// ** Service Imports
import { FileManagerService } from './file-manager.service'

export const fileManagerController = new Elysia({ prefix: '/file-manager' })
    .decorate({
        FileManagerService: new FileManagerService()
    })
    .use(FileManagerModels)
    .get('/', ({ FileManagerService, query }) => FileManagerService.getTableList(query), {
        query: 'fileManagerSearch'
    })
    .post('/', ({ FileManagerService, body, query }) => FileManagerService.create(body, query), {
        body: 'fileManager',
        query: 'fileManagerSearch'
    })
    .put('/', ({ FileManagerService, body, query }) => FileManagerService.uploadFile(query, body), {
        body: 'fileManagerUpload',
        query: 'fileManagerSearch'
    })
    .delete('/', ({ FileManagerService, body, query }) => FileManagerService.delete(body, query), {
        body: 'fileManager',
        query: 'fileManagerSearch'
    })
