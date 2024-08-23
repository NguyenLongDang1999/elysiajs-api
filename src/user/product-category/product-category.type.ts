// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Definition
export const productCategory = {
    id: t.String(),
    name: t.String(),
    slug: t.String(),
    image_uri: t.Nullable(t.String()),
    parent_id: t.Nullable(t.String())
}

export const productCategoryNestedList = t.Object({
    ...productCategory,
    children: t.Array(t.Object(productCategory))
})

// ** Types
export type IProductCategoryNestedListDTO = Static<typeof productCategoryNestedList>
