// ** Elysia Imports
import { redis } from '@atakan75/elysia-redis'
import { Elysia } from 'elysia'

// ** Models Imports
import { systemSettingsModels } from './system-settings.model'

// ** Service Imports
import { SystemSettingsService } from './system-settings.service'

export const systemSettingsController = new Elysia({ prefix: '/system-settings' })
    .decorate({
        SystemSettingsService: new SystemSettingsService()
    })
    .use(redis())
    .use(systemSettingsModels)
    .get('/', ({ SystemSettingsService, query, redis }) => SystemSettingsService.getDataList(query, redis), {
        query: 'systemSettingsSearch'
    })
    .get('metadata', ({ SystemSettingsService, redis }) => SystemSettingsService.metadata(redis))
    .post('/', ({ SystemSettingsService, body, redis }) => SystemSettingsService.create(body, redis), {
        body: 'systemSettings'
    })
    .patch(
        '/:id',
        ({ SystemSettingsService, body, params, redis }) => SystemSettingsService.update(params.id, body, redis),
        {
            body: 'systemSettings'
        }
    )
