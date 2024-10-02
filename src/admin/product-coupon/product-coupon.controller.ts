// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productCouponCreate,
    productCouponDelete,
    productCouponRetrieve,
    productCouponTableList,
    productCouponUpdate
} from './product-coupon.service'

export const productCouponController = new Elysia({ prefix: '/product-coupons' })
    .use(productCouponCreate)
    .use(productCouponUpdate)
    .use(productCouponDelete)
    .use(productCouponRetrieve)
    .use(productCouponTableList)
