// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Class Imports
import { SeedAuthClass } from './auth/auth.class'
import { SeedProductCategoryClass } from './product-category/product-category.class'

export const seed = new Elysia({ prefix: '/seed' })
    .decorate({
        SeedAuthClass: new SeedAuthClass(),
        SeedProductCategoryClass: new SeedProductCategoryClass()
    })
    .get('/', async ({ SeedAuthClass, SeedProductCategoryClass }) => {
        await SeedAuthClass.authSeedCreate()
        await SeedProductCategoryClass.productCategorySeedCreate()

        return { message: 'Seed data created successfully' }
    })
