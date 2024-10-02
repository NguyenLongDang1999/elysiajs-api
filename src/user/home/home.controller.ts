// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { SystemSettingsService } from '../system-settings/system-settings.service'
import { HomeService } from './home.service'

// ** Plugins Imports
import { authUserPlugin } from '../plugins/auth'
import { redisPlugin } from '../plugins/redis'

export const homeController = new Elysia({ prefix: '/home' })
    .decorate({
        HomeService: new HomeService(),
        UserSystemSettingsService: new SystemSettingsService()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .get('/data', ({ HomeService, UserSystemSettingsService, redis, user }) =>
        HomeService.data(UserSystemSettingsService, redis, user?.id)
    )
