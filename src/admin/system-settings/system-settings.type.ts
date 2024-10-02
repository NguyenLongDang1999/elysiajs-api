// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Utils Imports
import { INPUT_TYPE } from '@utils/enums'

// ** Types Definition
export const systemSettingsType = t.Object({
    label: t.String({ minLength: 1 }),
    key: t.String({ minLength: 1 }),
    setting_system_options: t.Optional(
        t.Array(
            t.Object({
                id: t.String(),
                name: t.String()
            })
        )
    ),
    redis_key: t.Optional(t.String()),
    description: t.Optional(t.String()),
    value: t.Optional(t.String()),
    input_type: t.Optional(t.Number({ default: INPUT_TYPE.TEXT }))
})

export const systemSettingsSearchType = t.Object({
    key: t.Optional(t.String())
})

// ** Types
export type ISystemSettingsDTO = Static<typeof systemSettingsType>

export type ISystemSettingsSearchDTO = Static<typeof systemSettingsSearchType>
