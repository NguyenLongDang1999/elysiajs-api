// ** Drizzle Imports
import { boolean, pgTable, text, timestamp, smallint } from 'drizzle-orm/pg-core'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'

// ** Schema
export const systemSettingsSchema = pgTable(
    'system-settings',
    {
        id: text('id').primaryKey().$defaultFn(createId),
        label: text('label').notNull(),
        key: text('key').notNull().unique(),
        value: text('value'),
        input_type: smallint('input_type').default(STATUS.INACTIVE),
        system_type: smallint('system_type'),
        description: text('description'),
        created_at: timestamp('created_at').notNull().defaultNow(),
        updated_at: timestamp('updated_at')
            .notNull()
            .$onUpdate(() => new Date()),
        deleted_flg: boolean('deleted_flg').default(false),
    }
)

export const systemSettingOptionsSchema = pgTable(
    'system-setting-options',
    {
        id: text('id').primaryKey().$defaultFn(createId),
        system_setting_id: text('system_setting_id').notNull().references(() => systemSettingsSchema.id),
        key: text('key').notNull(),
        displayValue: text('displayValue').notNull(),
    }
)
