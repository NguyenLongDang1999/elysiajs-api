// ** Elysia Imports

import { Elysia } from 'elysia'

// ** Service Imports
import { SystemSettingsService } from './system-settings.service'

export const systemSettingsController = new Elysia({ prefix: '/system-settings' })
    .decorate({
        UserSystemSettingsService: new SystemSettingsService()
    })

    .get('metadata', ({ UserSystemSettingsService, redis }) => UserSystemSettingsService.metadata(redis))
