// ** Elysia Imports
import { RedisClientType } from '@atakan75/elysia-redis'

// ** Database Imports
import { db } from '@src/database/drizzle'

// ** Types Imports
import { ISystemSettingsSearchDTO } from './system-settings.type'

// ** Drizzle Imports
import { and, desc, eq, ilike } from 'drizzle-orm'

// ** Utils Imports
import { systemSettingOptionsSchema, systemSettingsSchema } from '@src/database/drizzle/schema'
import { createRedisKey } from '@src/utils'
import { EXPIRES_AT, REDIS_KEY } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class SystemSettingsService {
    async getDataList(query: ISystemSettingsSearchDTO, redis: RedisClientType) {
        try {
            const systemSettingsCached = await redis.get(createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, query.key))

            if (systemSettingsCached) {
                return JSON.parse(systemSettingsCached)
            }

            const systemSettings = await db
                .select({
                    id: systemSettingsSchema.id,
                    key: systemSettingsSchema.key,
                    value: systemSettingsSchema.value,
                    label: systemSettingsSchema.label,
                    description: systemSettingsSchema.description,
                    input_type: systemSettingsSchema.input_type,
                    system_type: systemSettingsSchema.system_type,
                    setting_system_options: {
                        id: systemSettingOptionsSchema.key,
                        name: systemSettingOptionsSchema.displayValue
                    }
                })
                .from(systemSettingsSchema)
                .where(
                    and(eq(systemSettingsSchema.deleted_flg, false), ilike(systemSettingsSchema.key, `${query.key}%`))
                )
                .leftJoin(
                    systemSettingOptionsSchema,
                    eq(systemSettingOptionsSchema.system_setting_id, systemSettingsSchema.id)
                )
                .orderBy(desc(systemSettingsSchema.created_at))

            const resultMap = new Map()

            systemSettings.forEach((_system) => {
                if (!resultMap.has(_system.id)) {
                    resultMap.set(_system.id, {
                        ..._system,
                        setting_system_options: []
                    })
                }

                resultMap.get(_system.id).setting_system_options.push(_system.setting_system_options)
            })

            const result = Array.from(resultMap.values())

            await redis.set(
                createRedisKey(REDIS_KEY.SYSTEM_SETTINGS, query.key),
                JSON.stringify(result),
                EXPIRES_AT.REDIS_EXPIRES_AT
            )

            return result
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async metadata(redis: RedisClientType) {
        try {
            const systemSettings = await this.getDataList({ key: 'system_' }, redis)
            const theme_colour = systemSettings?.find((_s) => _s.key === 'system_theme_colour')

            if (!theme_colour) {
                // const systemSetting = await db
                //     .insert(systemSettingsSchema)
                //     .values({
                //         key: 'system_theme_colour',
                //         value: 'blue',
                //         label: 'Màu chủ đạo của Website',
                //         input_type: INPUT_TYPE.SELECT
                //     })
                //     .returning({
                //         id: systemSettingsSchema.id
                //     })
                // await db
                //     .insert(systemSettingOptionsSchema)
                //     .values({
                //         key: 'blue',
                //         displayValue: 'Blue',
                //         system_setting_id: systemSetting[0].id
                //     })
                //     .returning()
            }

            return {
                theme_colour: theme_colour?.value,
                system: systemSettings
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
