// ** Drizzle Imports
import { boolean, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'

// ** Schema Imports
import { productCategorySchema } from '../product-category'

// ** Schema
export const productBrandSchema = pgTable('product-brand', {
    id: text('id').primaryKey().$defaultFn(createId),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    image_uri: text('image_uri'),
    description: text('description'),
    status: smallint('status').default(STATUS.INACTIVE),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
    deleted_flg: boolean('deleted_flg').default(false)
})

export const productCategoryBrandSchema = pgTable('product-category-brand', {
    product_brand_id: text('product_brand_id')
        .notNull()
        .references(() => productBrandSchema.id),
    product_category_id: text('product_category_id')
        .notNull()
        .references(() => productCategorySchema.id)
})
