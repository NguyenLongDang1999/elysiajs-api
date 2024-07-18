// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { systemSettingsSearchType, systemSettingsType } from './system-settings.type'

export const systemSettingsModels = new Elysia().model({
    systemSettings: systemSettingsType,
    systemSettingsSearch: systemSettingsSearchType
})
