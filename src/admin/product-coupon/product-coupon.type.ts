// ** Elysia Imports
import { Static, t } from 'elysia'

// ** Types Imports
import { paginationType } from '@src/types/core.type'

// ** Utils Imports
import { SPECIAL_PRICE_TYPE } from '@utils/enums'

// ** Types Definition
export const productCouponType = t.Object({
    code: t.String({ minLength: 1 }),
    description: t.Optional(t.String()),
    discount_value: t.Number({ default: 0 }),
    discount_type: t.Number({ default: SPECIAL_PRICE_TYPE.PRICE }),
    start_date: t.Date(),
    end_date: t.Date(),
    status: t.Optional(t.Number()),
    minimum_order_value: t.Number({ default: 0 }),
    max_uses: t.Optional(t.Number()),
    times_used: t.Optional(t.Number())
})

export const productCouponSearchType = t.Object({
    ...paginationType,
    code: t.Optional(t.String()),
    status: t
        .Transform(t.Optional(t.Exclude(t.Union([t.String(), t.Number()]), t.Number())))
        .Decode((value) => (typeof value === 'string' ? parseInt(value) : value))
        .Encode((value) => value.toString())
})

// ** Types
export type IProductCouponDTO = Static<typeof productCouponType>

export type IProductCouponSearchDTO = Static<typeof productCouponSearchType>
