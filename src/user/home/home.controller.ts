// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
// import { homeModels } from './home.model'

// ** Service Imports
import { SystemSettingsService } from '../system-settings/system-settings.service'
import { HomeService } from './home.service'

export const homeController = new Elysia({ prefix: '/home' })
    .decorate({
        HomeService: new HomeService(),
        SystemSettingsService: new SystemSettingsService()
    })
    .use(redis())
    // .use(homeModels)
    .get('data', async ({ HomeService, SystemSettingsService, redis }) => HomeService.data(SystemSettingsService, redis))
