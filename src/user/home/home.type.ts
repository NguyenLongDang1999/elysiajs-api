// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'

// ** Types Definition
export const homeProductCollectionType = t.Object({
    product_collection: t.Array(
        t.Object({
            product_collection_id: t.String(),
            product_id: t.Array(t.String())
        })
    )
})

export const homeProductFlashDealsType = t.Object({
    flash_deals_id: t.String(),
    product_id: t.Array(t.String())
})

export const productAttributeValue = t.Object({
    id: t.String(),
    value: t.String()
})

export const productAttribute = t.Object({
    id: t.String(),
    name: t.String(),
    product_attribute_values: t.Array(productAttributeValue)
})

// ** Types
export type IHomeProductCollectionDTO = Static<typeof homeProductCollectionType>

export type IHomeProductFlashDealsDTO = Static<typeof homeProductFlashDealsType>

export type IProductAttribute = Static<typeof productAttribute>
