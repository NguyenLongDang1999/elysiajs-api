// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Class Imports
import { SeedAuthClass } from './auth/auth.class'
import { SeedProductBrandClass } from './product-brand/product-brand.class'
import { SeedProductCategoryClass } from './product-category/product-category.class'

export const seed = new Elysia({ prefix: '/seed' })
    .decorate({
        SeedAuthClass: new SeedAuthClass(),
        SeedProductCategoryClass: new SeedProductCategoryClass(),
        SeedProductBrandClass: new SeedProductBrandClass()
    })
    .get('/', async ({ SeedAuthClass, SeedProductCategoryClass, SeedProductBrandClass }) => {
        await SeedAuthClass.authSeedCreate()
        await SeedProductCategoryClass.productCategorySeedCreate()
        await SeedProductBrandClass.productBrandSeedCreate()

        return { message: 'Seed data created successfully' }
    })
