// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { systemSettingsSearchType } from './system-settings.type'

export const systemSettingsModels = new Elysia().model({
    systemSettingsSearch: systemSettingsSearchType
})
