// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Controllers Imports
import { authController } from './auth/auth.controller'
import { fileManagerController } from './file-manager/file-manager.controller'
import { ordersController } from './orders/orders.controller'
import { productAttributeController } from './product-attribute/product-attribute.controller'
import { productBrandController } from './product-brand/product-brand.controller'
import { productCategoryController } from './product-category/product-category.controller'
import { productCollectionController } from './product-collection/product-collection.controller'
import { productCouponController } from './product-coupon/product-coupon.controller'
import { productFlashDealsController } from './product-flash-deals/product-flash-deals.controller'
import { productInventoryController } from './product-inventory/product-inventory.controller'
import { productReviewsController } from './product-reviews/product-reviews.controller'
import { productController } from './product/product.controller'
import { systemSettingsController } from './system-settings/system-settings.controller'

// ** Plugins Imports
import { authPlugin } from './plugins/auth'

export const admin = new Elysia({ prefix: '/admin' })
    .use(authPlugin)
    .use(productCategoryController)
    .use(productBrandController)
    .use(productAttributeController)
    .use(productCollectionController)
    .use(productFlashDealsController)
    .use(productInventoryController)
    .use(productCouponController)
    .use(productController)
    .use(productReviewsController)
    .use(fileManagerController)
    .use(systemSettingsController)
    .use(ordersController)
    .use(authController)
