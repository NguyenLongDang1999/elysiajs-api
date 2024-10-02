// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { systemSettingMetadata } from './system-settings.service'

export const systemSettingsController = new Elysia({ prefix: '/system-settings' })
    .use(systemSettingMetadata)
