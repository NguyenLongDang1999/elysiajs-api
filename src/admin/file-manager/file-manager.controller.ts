// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { FileManagerModels } from './file-manager.model'

// ** Service Imports
import { FileManagerService } from './file-manager.service'

// ** Plugins Imports
import { authPlugin } from '../plugins/auth'

export const fileManagerController = new Elysia({ prefix: '/file-manager' })
    .decorate({
        FileManagerService: new FileManagerService(),
    })
    .use(authPlugin)
    .use(FileManagerModels)
    .get('/', ({ FileManagerService, query }) => FileManagerService.getTableList(query), {
        query: 'fileManagerSearch',
    })
