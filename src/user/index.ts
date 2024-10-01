// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Controllers Imports
import { authController } from './auth/auth.controller'
import { cartController } from './cart/cart.controller'
import { homeController } from './home/home.controller'
import { productCategoryController } from './product-category/product-category.controller'
import { productController } from './product/product.controller'
import { systemSettingsController } from './system-settings/system-settings.controller'
import { wishlistController } from './wishlist/wishlist.controller'

export const user = new Elysia({ prefix: '/user' })
    .use(authController)
    .use(cartController)
    .use(homeController)
    .use(productController)
    .use(wishlistController)
    .use(systemSettingsController)
    .use(productCategoryController)
