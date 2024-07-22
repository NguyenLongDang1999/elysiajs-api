// ** Drizzle Imports
import { relations } from 'drizzle-orm'
import { boolean, decimal, integer, json, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'

// ** Third Party Imports
import { createId } from '@paralleldrive/cuid2'

// ** Utils Imports
import { MANAGE_INVENTORY, PRODUCT_TYPE, STATUS } from '@src/utils/enums'

// ** Schema Imports
import { adminsSchema } from '../admins'
import { productAttributeValuesSchema } from '../product-attributes'
import { productBrandSchema } from '../product-brands'
import { productCategorySchema } from '../product-category'

// ** Schema
export const productSchema = pgTable('product', {
    id: text('id').primaryKey().$defaultFn(createId),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    image_uri: text('image_uri'),
    short_description: text('short_description'),
    description: text('description'),
    technical_specifications: json('technical_specifications'),
    product_category_id: text('product_category_id')
        .notNull()
        .references(() => productCategorySchema.id),
    product_brand_id: text('product_brand_id').references(() => productBrandSchema.id),
    status: smallint('status').default(STATUS.INACTIVE),
    product_type: smallint('product_type').default(PRODUCT_TYPE.SINGLE),
    price: decimal('price', { precision: 18, scale: 0 }),
    special_price: decimal('special_price', { precision: 18, scale: 0 }),
    special_price_type: smallint('special_price_type'),
    meta_title: text('meta_title'),
    meta_description: text('meta_description'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
    deleted_flg: boolean('deleted_flg').default(false)
})

export const productVariantsSchema = pgTable('product-variants', {
    id: text('id').primaryKey().$defaultFn(createId),
    product_id: text('product_id')
        .notNull()
        .references(() => productSchema.id),
    is_default: boolean('is_default').default(false),
    label: text('label'),
    sku: text('sku').notNull().unique(),
    manage_inventory: smallint('manage_inventory').default(MANAGE_INVENTORY.NO),
    price: decimal('price', { precision: 18, scale: 0 }),
    special_price: decimal('special_price', { precision: 18, scale: 0 }),
    special_price_type: smallint('special_price_type'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
    deleted_flg: boolean('deleted_flg').default(false)
})

export const productVariantAttributeValuesSchema = pgTable('product-variant-attribute-values', {
    product_variant_id: text('product_variant_id')
        .notNull()
        .references(() => productVariantsSchema.id),
    product_attribute_value_id: text('product_attribute_value_id')
        .notNull()
        .references(() => productAttributeValuesSchema.id)
})

export const productImagesSchema = pgTable('product-images', {
    id: text('id').primaryKey().$defaultFn(createId),
    product_id: text('product_id')
        .notNull()
        .references(() => productSchema.id),
    image_uri: text('image_uri').notNull(),
    index: smallint('index'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
    deleted_flg: boolean('deleted_flg').default(false)
})

export const productInventorySchema = pgTable('product-inventory', {
    id: text('id').primaryKey().$defaultFn(createId),
    product_variant_id: text('product_variant_id')
        .notNull()
        .references(() => productVariantsSchema.id)
        .unique(),
    quantity: integer('quantity')
})

export const productInventoryTransactionSchema = pgTable('product-inventory-transactions', {
    id: text('id').primaryKey().$defaultFn(createId),
    admin_id: text('admin_id').references(() => adminsSchema.id),
    product_variant_id: text('product_variant_id')
        .notNull()
        .references(() => productVariantsSchema.id),
    product_inventory_id: text('product_inventory_id')
        .notNull()
        .references(() => productInventorySchema.id),
    transaction_type: smallint('transaction_type'),
    quantity: integer('quantity'),
    description: text('description').notNull()
})

export const productRelationsSchema = pgTable('product-relations', {
    id: text('id').primaryKey().$defaultFn(createId),
    product_id: text('product_id').references(() => productSchema.id),
    related_product_id: text('related_product_id')
        .notNull()
        .references(() => productSchema.id),
    relation_type: smallint('relation_type')
})

// ** Relations
export const productRelations = relations(productSchema, ({ one, many }) => ({
    productCategory: one(productCategorySchema, {
        fields: [productSchema.product_category_id],
        references: [productCategorySchema.id]
    }),
    productBrand: one(productBrandSchema, {
        fields: [productSchema.product_brand_id],
        references: [productBrandSchema.id]
    }),
    productImages: many(productImagesSchema),
    productVariants: many(productVariantsSchema)
}))

export const productVariantsRelations = relations(productVariantsSchema, ({ one, many }) => ({}))
