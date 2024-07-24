// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Controllers Imports
import { authController } from './auth/auth.controller'
import { fileManagerController } from './file-manager/file-manager.controller'
import { productAttributeController } from './product-attribute/product-attribute.controller'
import { productBrandController } from './product-brand/product-brand.controller'
import { productCategoryController } from './product-category/product-category.controller'
import { productCollectionController } from './product-collection/product-collection.controller'
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
    .use(productController)
    .use(fileManagerController)
    .use(systemSettingsController)
    .use(authController)
