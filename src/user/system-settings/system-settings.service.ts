// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Models Imports
import { UserSystemSettingsClass } from './system-settings.class'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const systemSettingDataList = new Elysia()
    .decorate({
        UserSystemSettingsClass: new UserSystemSettingsClass()
    })
    .use(redisPlugin)
    .get('/', async ({ UserSystemSettingsClass, redis, query }) => UserSystemSettingsClass.getDataList(query, redis))

export const systemSettingMetadata = new Elysia()
    .decorate({
        UserSystemSettingsClass: new UserSystemSettingsClass()
    })
    .use(redisPlugin)
    .get('/metadata', async ({ UserSystemSettingsClass, redis }) => {
        try {
            const systemSettings = await UserSystemSettingsClass.getDataList({ key: 'system_' }, redis)

            const theme_colour = systemSettings.find((_s: { key: string }) => _s.key === 'system_theme_colour')

            return {
                theme_colour: theme_colour.value,
                system: systemSettings
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    })
