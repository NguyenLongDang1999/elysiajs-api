// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    systemSettingCreate,
    systemSettingDataList,
    systemSettingMetadata,
    systemSettingUpdate
} from './system-settings.service'

export const systemSettingsController = new Elysia({ prefix: '/system-settings' })
    .use(systemSettingCreate)
    .use(systemSettingUpdate)
    .use(systemSettingMetadata)
    .use(systemSettingDataList)
