// ** Elysia Imports
import { Static, t } from 'elysia'

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

// ** Types
export type IHomeProductCollectionDTO = Static<typeof homeProductCollectionType>

export type IHomeProductFlashDealsDTO = Static<typeof homeProductFlashDealsType>
