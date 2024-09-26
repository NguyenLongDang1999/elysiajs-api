// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Models Imports
import { productCouponModels } from './product-coupon.model'

// ** Service Imports
import { ProductCouponService } from './product-coupon.service'

export const productCouponController = new Elysia({ prefix: '/product-coupons' })
    .decorate({
        ProductCouponService: new ProductCouponService()
    })
    .use(productCouponModels)
    .get('/', ({ ProductCouponService, query }) => ProductCouponService.getTableList(query), {
        query: 'productCouponSearch'
    })
    .get('/:id', ({ ProductCouponService, params }) => ProductCouponService.retrieve(params.id))
    .post('/', ({ ProductCouponService, body }) => ProductCouponService.create(body), {
        body: 'productCoupon'
    })
    .patch(
        '/:id',
        ({ ProductCouponService, body, params }) => ProductCouponService.update(params.id, body),
        {
            body: 'productCoupon'
        }
    )
    .delete(
        '/:id',
        ({ ProductCouponService, query, params }) =>
            ProductCouponService.delete(params.id, query),
        {
            query: 'productCouponDelete'
        }
    )
