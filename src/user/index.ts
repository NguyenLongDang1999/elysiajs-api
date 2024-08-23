// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Controllers Imports
import { homeController } from './home/home.controller'
import { productCategoryController } from './product-category/product-category.controller'
import { systemSettingsController } from './system-settings/system-settings.controller'

export const user = new Elysia({ prefix: '/user' })
    .use(homeController)
    .use(productCategoryController)
    .use(systemSettingsController)
