// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Service Imports
import { SystemSettingsService } from './system-settings.service'

export const systemSettingsController = new Elysia({ prefix: '/system-settings' })
    .decorate({
        UserSystemSettingsService: new SystemSettingsService()
    })
    .use(redis())
    .get('metadata', ({ UserSystemSettingsService, redis }) => UserSystemSettingsService.metadata(redis))
