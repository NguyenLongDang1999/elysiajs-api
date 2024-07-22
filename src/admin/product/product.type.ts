// ** Elysia Imports
import { StaticDecode } from '@sinclair/typebox'
import { Static, t } from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productType = t.Object({
    sku: t.Optional(t.String()),
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    product_category_id: t.String(),
    product_brand_id: t.Optional(t.String()),
    product_variants: t
        .Transform(t.Optional(t.Array(t.String())))
        .Decode((value) => (typeof value === 'string' ? JSON.parse(value) : value))
        .Encode((value) => value.toString()),
    product_relations: t
        .Transform(t.Optional(t.String()))
        .Decode((value) => JSON.parse(value))
        .Encode((value) => value.toString()),
    product_images: t
        .Transform(t.Optional(t.String()))
        .Decode((value) => JSON.parse(value))
        .Encode((value) => value.toString()),
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
        .Transform(t.Optional(t.String()))
        .Decode((value) => parseInt(value))
        .Encode((value) => value.toString()),
    product_type: t.Optional(t.String()),
    not_flash_deals: t.Optional(t.String()),
    product_id_flash_deals: t.Optional(t.String())
})

// ** Types
export type IProductDTO = Static<typeof productType>

export type IProductSearchDTO = StaticDecode<typeof productSearchType>
