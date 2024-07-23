// ** Elysia Imports
import { StaticDecode } from '@sinclair/typebox'
import { Static, t } from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
const productVariantType = t.Object({
    label: t.String({ minLength: 1 }),
    is_default: t.Boolean({ default: false }),
    sku: t.String({ minLength: 1 }),
    price: t.Optional(t.Number({ default: 0 })),
    special_price: t.Optional(t.Number({ default: 0 })),
    special_price_type: t.Optional(t.Number()),
    quantity: t.Optional(t.Number({ default: 0 })),
    manage_inventory: t.Optional(t.Number()),
    product_attribute_value_id: t.Array(t.String(), {
        minItems: 1
    })
})

const productImageType = t.Object({
    id: t.Optional(t.String()),
    image_uri: t.Optional(t.String())
})

const productRelationsType = t.Object({
    related_product_id: t.Optional(t.String()),
    relation_type: t.Optional(t.Number())
})

export const productType = t.Object({
    sku: t.Optional(t.String()),
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    product_category_id: t.String(),
    product_brand_id: t.Optional(t.String()),
    product_variants: t.Optional(t.Array(productVariantType)),
    product_relations: t.Optional(t.Array(productRelationsType)),
    product_images: t.Optional(t.Array(productImageType)),
    price: t.Optional(t.Number({ default: 0 })),
    special_price: t.Optional(t.Number({ default: 0 })),
    special_price_type: t.Optional(t.Number()),
    quantity: t.Optional(t.Number({ default: 0 })),
    technical_specifications: t.Optional(t.String()),
    short_description: t.Optional(t.String()),
    description: t.Optional(t.String()),
    image_uri: t.Optional(t.String()),
    status: t.Optional(t.Number()),
    manage_inventory: t.Optional(t.Number()),
    meta_title: t.Optional(t.String()),
    meta_description: t.Optional(t.String())
})

export const productSearchType = t.Object({
    ...paginationType,
    sku: t.Optional(t.String()),
    name: t.Optional(t.String()),
    product_category_id: t.Optional(t.String()),
    product_brand_id: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.Number())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value.toString()),
    product_type: t.Optional(t.String()),
    not_flash_deals: t.Optional(t.String()),
    product_id_flash_deals: t.Optional(t.String())
})

// ** Types
export type IProductDTO = Static<typeof productType>

export type IProductSearchDTO = StaticDecode<typeof productSearchType>

export type IProductVariantDTO = Static<typeof productVariantType>
