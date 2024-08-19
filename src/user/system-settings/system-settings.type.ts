// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Definition
export const systemSettingsSearchType = t.Object({
    key: t.Optional(t.String())
})

// ** Types
export type ISystemSettingsSearchDTO = Static<typeof systemSettingsSearchType>
