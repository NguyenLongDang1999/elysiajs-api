// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Controllers Imports
import { authController } from './auth/auth.controller'
import { homeController } from './home/home.controller'
import { productCategoryController } from './product-category/product-category.controller'
import { productController } from './product/product.controller'
import { systemSettingsController } from './system-settings/system-settings.controller'

export const user = new Elysia({ prefix: '/user' })
    .use(authController)
    .use(homeController)
    .use(productCategoryController)
    .use(productController)
    .use(systemSettingsController)
