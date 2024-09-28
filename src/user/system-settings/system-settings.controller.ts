// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { SystemSettingsService } from './system-settings.service'

// ** Plugins Imports
import { redisPlugin } from '../plugins/redis'

export const systemSettingsController = new Elysia({ prefix: '/system-settings' })
    .decorate({
        UserSystemSettingsService: new SystemSettingsService()
    })
    .use(redisPlugin)
    .get('metadata', ({ UserSystemSettingsService, redis }) => UserSystemSettingsService.metadata(redis))
