// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Controllers Imports
import { productCategoryController } from './product-category/product-category.controller'
import { authController } from './auth/auth.controller'

export const admin = new Elysia({ prefix: '/admin' }).use(productCategoryController).use(authController)
