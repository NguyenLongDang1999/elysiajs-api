// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productType = t.Object({
    name: t.String({ minLength: 1 }),
    slug: t.String({ minLength: 1 }),
    product_category_id: t.Array(t.String(), {
        minItems: 1
    }),
    product_attribute_values: t.Array(
        t.Object({
            id: t.String(),
            value: t.String()
        }),
        { minItems: 1 }
    ),
    description: t.Optional(t.String()),
    status: t.Optional(t.Number())
})

export const productSearchType = t.Object({
    ...paginationType,
    sku: t.Optional(t.String()),
    name: t.Optional(t.String()),
    product_category_id: t.Optional(t.String()),
    product_brand_id: t.Optional(t.String()),
    status: t.Optional(t.String()),
    product_type: t.Optional(t.String()),
    not_flash_deals: t.Optional(t.String()),
    product_id_flash_deals: t.Optional(t.String())
})

// ** Types
export type IProductDTO = Static<typeof productType>

export type IProductSearchDTO = Static<typeof productSearchType>
