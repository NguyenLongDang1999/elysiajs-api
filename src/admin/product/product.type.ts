// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
const productImageType = t.Object({
    id: t.Optional(t.String()),
    image_uri: t.Optional(t.String())
})

export const productSingleType = t.Object({
    sku: t.String({ minLength: 1 }),
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    image_uri: t.Optional(t.String()),
    product_category_id: t.String(),
    product_brand_id: t.Optional(t.String()),
    product_images: t.Optional(t.Array(productImageType)),
    price: t.Optional(t.Number({ default: 0 })),
    special_price: t.Optional(t.Number({ default: 0 })),
    special_price_type: t.Optional(t.Number()),
    quantity: t.Optional(t.Number({ default: 0 })),
    technical_specifications: t.Optional(
        t.Array(
            t.Object({
                title: t.String({ minLength: 1 }),
                content: t.String({ minLength: 1 })
            })
        )
    ),
    short_description: t.Optional(t.String()),
    description: t.String({ minLength: 1 }),
    status: t.Optional(t.Number()),
    manage_inventory: t.Optional(t.Number()),
    meta_title: t.Optional(t.String()),
    meta_description: t.Optional(t.String())
})

export const productVariantsType = t.Object({
    sku: t.String({ minLength: 1 }),
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    image_uri: t.Optional(t.String()),
    product_category_id: t.String(),
    product_brand_id: t.Optional(t.String()),
    technical_specifications: t.Optional(
        t.Array(
            t.Object({
                title: t.String({ minLength: 1 }),
                content: t.String({ minLength: 1 })
            })
        )
    ),
    short_description: t.Optional(t.String()),
    description: t.String({ minLength: 1 }),
    status: t.Optional(t.Number()),
    meta_title: t.Optional(t.String()),
    meta_description: t.Optional(t.String()),
    price: t.Optional(t.Number({ default: 0 })),
    special_price: t.Optional(t.Number({ default: 0 })),
    special_price_type: t.Optional(t.Number()),
    product_variants: t.Array(
        t.Object({
            label: t.String({ minLength: 1 }),
            is_default: t.Boolean({ default: false }),
            price: t.Number({ default: 0 }),
            special_price: t.Number({ default: 0 }),
            special_price_type: t.Optional(t.Number()),
            quantity: t.Optional(t.Number({ default: 0 })),
            manage_inventory: t.Optional(t.Number()),
            product_attribute_value_id: t.Array(t.String(), {
                minItems: 1
            })
        })
    )
})

export const productUpdateGeneralVariantsType = t.Object({
    sku: t.String({ minLength: 1 }),
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    image_uri: t.Optional(t.String()),
    technical_specifications: t.Optional(
        t.Array(
            t.Object({
                title: t.String({ minLength: 1 }),
                content: t.String({ minLength: 1 })
            })
        )
    ),
    short_description: t.Optional(t.String()),
    description: t.String({ minLength: 1 }),
    status: t.Optional(t.Number()),
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
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value),
    product_type: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.String())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value),
    not_flash_deals: t.Optional(t.String()),
    product_id_flash_deals: t.Optional(t.String()),
    product_id_collection: t.Optional(t.String()),
    flash_deals_id: t.Optional(t.String())
})

export const productRelationsType = t.Object({
    id: t.String(),
    product_id: t.Array(t.String()),
    product_relation_type: t.Number()
})

export const productImagesType = t.Object({
    id: t.String(),
    image_uri: t.String(),
    product_images: t.Array(productImageType)
})

export const productSearchSelectedType = t.Object({
    q: t.Optional(t.String())
})

// ** Types
export type IProductSearchDTO = Static<typeof productSearchType>

export type IProductUpdateGeneralVariantDTO = Static<typeof productUpdateGeneralVariantsType>

export type IProductRelationsDTO = Static<typeof productRelationsType>

export type IProductImagesDTO = Static<typeof productImagesType>

export type IProductSingleDTO = Static<typeof productSingleType>

export type IProductVariantsDTO = Static<typeof productVariantsType>
