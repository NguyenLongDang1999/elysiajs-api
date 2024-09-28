// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { systemSettingsModels } from './system-settings.model'

// ** Service Imports
import { SystemSettingsService } from './system-settings.service'

// ** Plugins Imports
import { redisPlugin } from '../plugins/redis'

export const systemSettingsController = new Elysia({ prefix: '/system-settings' })
    .decorate({
        SystemSettingsService: new SystemSettingsService()
    })
    .use(redisPlugin)
    .use(systemSettingsModels)
    .get('/', ({ SystemSettingsService, query, adminRedis }) => SystemSettingsService.getDataList(query, adminRedis), {
        query: 'systemSettingsSearch'
    })
    .get('metadata', ({ SystemSettingsService, adminRedis }) => SystemSettingsService.metadata(adminRedis))
    .post('/', ({ SystemSettingsService, body, adminRedis }) => SystemSettingsService.create(body, adminRedis), {
        body: 'systemSettings'
    })
    .patch(
        '/:id',
        ({ SystemSettingsService, body, params, adminRedis }) => SystemSettingsService.update(params.id, body, adminRedis),
        {
            body: 'systemSettings'
        }
    )
