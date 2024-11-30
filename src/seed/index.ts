// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Class Imports
import { SeedAuthClass } from './auth/auth.class'
import { SeedProductAttributeClass } from './product-attribute/product-attribute.class'
import { SeedProductBrandClass } from './product-brand/product-brand.class'
import { SeedProductCategoryClass } from './product-category/product-category.class'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const seed = new Elysia({ prefix: '/seed' })
    .use(redisPlugin)
    .decorate({
        SeedAuthClass: new SeedAuthClass(),
        SeedProductCategoryClass: new SeedProductCategoryClass(),
        SeedProductBrandClass: new SeedProductBrandClass(),
        SeedProductAttributeClass: new SeedProductAttributeClass()
    })
    .get('/', async ({ redis, SeedAuthClass, SeedProductCategoryClass, SeedProductBrandClass, SeedProductAttributeClass }) => {
        await redis.forgetAll()
        await SeedAuthClass.authSeedCreate()
        await SeedProductCategoryClass.productCategorySeedCreate()
        await SeedProductBrandClass.productBrandSeedCreate()
        await SeedProductAttributeClass.productAttributeSeedCreate()

        return { message: 'Seed data created successfully' }
    })
