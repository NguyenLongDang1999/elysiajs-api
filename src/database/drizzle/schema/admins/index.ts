// ** Drizzle Imports
import { boolean, pgTable, text, timestamp, smallint, index } from 'drizzle-orm/pg-core'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'

// ** Schema
export const adminsSchema = pgTable(
    'admins',
    {
        id: text('id').primaryKey().$defaultFn(createId),
        name: text('name').notNull(),
        email: text('email').notNull().unique(),
        password: text('password').notNull(),
        phone: text('phone').notNull(),
        job: text('job'),
        gender: smallint('gender'),
        address: text('address'),
        refresh_token: text('refresh_token'),
        role: smallint('role'),
        status: smallint('status').default(STATUS.INACTIVE),
        image_uri: text('image_uri'),
        created_at: timestamp('created_at').notNull().defaultNow(),
        updated_at: timestamp('updated_at')
            .notNull()
            .$onUpdate(() => new Date()),
        deleted_flg: boolean('deleted_flg').default(false)
    },
    (table) => {
        return {
            statusIdx: index().on(table.status, table.role, table.gender)
        }
    }
)
