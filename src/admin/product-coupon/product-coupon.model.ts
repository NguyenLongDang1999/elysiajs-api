// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { deleteType } from '@src/types/core.type'
import {
    productCouponSearchType,
    productCouponType
} from './product-coupon.type'

export const productCouponModels = new Elysia().model({
    productCoupon: productCouponType,
    productCouponSearch: productCouponSearchType,
    productCouponDelete: deleteType
})
