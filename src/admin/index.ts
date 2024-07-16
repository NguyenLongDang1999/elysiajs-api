// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Controllers Imports
import { authController } from './auth/auth.controller'
import { fileManagerController } from './file-manager/file-manager.controller'
import { productBrandController } from './product-brand/product-brand.controller'
import { productCategoryController } from './product-category/product-category.controller'

export const admin = new Elysia({ prefix: '/admin' })
    .use(productCategoryController)
    .use(productBrandController)
    .use(fileManagerController)
    .use(authController)
