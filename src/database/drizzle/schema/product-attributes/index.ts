// ** Drizzle Imports
import { relations } from 'drizzle-orm'
import { boolean, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Utils Imports
import { STATUS } from '@src/utils/enums'

// ** Schema Imports
import { productCategorySchema } from '../product-category'

// ** Schema
export const productAttributeSchema = pgTable('product-attribute', {
    id: text('id').primaryKey().$defaultFn(createId),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    status: smallint('status').default(STATUS.INACTIVE),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
    deleted_flg: boolean('deleted_flg').default(false)
})

export const productAttributeValuesSchema = pgTable('product-attribute-values', {
    id: text('id').primaryKey().$defaultFn(createId),
    value: text('value').notNull(),
    product_attribute_id: text('product_attribute_id')
        .notNull()
        .references(() => productAttributeSchema.id)
})

export const productCategoryAttributeSchema = pgTable('product-category-attribute', {
    product_attribute_id: text('product_attribute_id')
        .notNull()
        .references(() => productAttributeSchema.id),
    product_category_id: text('product_category_id')
        .notNull()
        .references(() => productCategorySchema.id)
})

// ** Relations
export const productAttributeRelations = relations(productAttributeSchema, ({ many }) => ({
    productAttributeValues: many(productAttributeValuesSchema),
    productCategoryAttributes: many(productCategoryAttributeSchema)
}))

export const productAttributeValuesRelations = relations(productAttributeValuesSchema, ({ one, many }) => ({
    productAttribute: one(productAttributeSchema, {
        fields: [productAttributeValuesSchema.product_attribute_id],
        references: [productAttributeSchema.id]
    }),
    productVariantAttributeValues: many(productAttributeValuesSchema)
}))

export const productCategoryAttributeRelations = relations(productCategoryAttributeSchema, ({ one }) => ({
    productAttribute: one(productAttributeSchema, {
        fields: [productCategoryAttributeSchema.product_attribute_id],
        references: [productAttributeSchema.id]
    }),
    productCategory: one(productCategorySchema, {
        fields: [productCategoryAttributeSchema.product_category_id],
        references: [productCategorySchema.id]
    })
}))
