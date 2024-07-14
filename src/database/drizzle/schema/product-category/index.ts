// ** Drizzle Imports
import { boolean, pgTable, text, timestamp, smallint, AnyPgColumn, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'

// ** Schema
export const productCategorySchema = pgTable(
    'product-category',
    {
        id: text('id').primaryKey().$defaultFn(createId),
        name: text('name').notNull(),
        slug: text('slug').notNull().unique(),
        parent_id: text('parent_id').references((): AnyPgColumn => productCategorySchema.id),
        image_uri: text('image_uri'),
        description: text('description'),
        status: smallint('status').default(STATUS.INACTIVE),
        meta_title: text('meta_title'),
        meta_description: text('meta_description'),
        created_at: timestamp('created_at').notNull().defaultNow(),
        updated_at: timestamp('updated_at')
            .notNull()
            .$onUpdate(() => new Date()),
        deleted_flg: boolean('deleted_flg').default(false),
    },
    (table) => {
        return {
            statusIdx: index().on(table.status, table.parent_id),
        }
    },
)

// ** Relations
export const productCategoryRelations = relations(productCategorySchema, ({ one, many }) => ({
    productCategory: one(productCategorySchema, {
        relationName: 'productCategory',
        fields: [productCategorySchema.parent_id],
        references: [productCategorySchema.id],
    }),
}))
