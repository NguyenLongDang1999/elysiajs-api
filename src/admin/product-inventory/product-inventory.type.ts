// ** Elysia Imports
import { StaticDecode } from '@sinclair/typebox'
import { Static, t } from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Types Definition
export const productInventoryType = t.Object({
    product_variant_id: t.String({ minLength: 1 }),
    quantity: t.Number()
})

export const productInventorySearchType = t.Object({
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
export type IProductInventoryDTO = Static<typeof productInventoryType>

export type IProductInventorySearchDTO = StaticDecode<typeof productInventorySearchType>