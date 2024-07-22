// ** Drizzle Imports
import { relations } from 'drizzle-orm'
import { boolean, decimal, integer, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'

// ** Schema Imports
import { productVariantsSchema } from '../product'

// ** Schema
export const flashDealsSchema = pgTable('flash-deals', {
    id: text('id').primaryKey().$defaultFn(createId),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    status: smallint('status').default(STATUS.INACTIVE),
    start_time: timestamp('start_time').notNull(),
    end_time: timestamp('end_time').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
    deleted_flg: boolean('deleted_flg').default(false)
})

export const flashDealProductsSchema = pgTable('flash-deal-product', {
    flash_deal_id: text('flash_deal_id')
        .notNull()
        .references(() => flashDealsSchema.id),
    product_variants_id: text('product_variants_id')
        .notNull()
        .references(() => productVariantsSchema.id),
    price: decimal('price', { precision: 18, scale: 0 }),
    special_price: decimal('special_price', { precision: 18, scale: 0 }),
    special_price_type: smallint('special_price_type'),
    quantity_limit: integer('quantity_limit')
})

// ** Relations
export const flashDealsRelations = relations(flashDealsSchema, ({ many }) => ({
    flashDealProducts: many(flashDealProductsSchema)
}))

export const flashDealProductsRelations = relations(flashDealProductsSchema, ({ one }) => ({
    flashDeal: one(flashDealsSchema, {
        fields: [flashDealProductsSchema.flash_deal_id],
        references: [flashDealsSchema.id]
    }),
    productVariants: one(productVariantsSchema, {
        fields: [flashDealProductsSchema.product_variants_id],
        references: [productVariantsSchema.id]
    })
}))
