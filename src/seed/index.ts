// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Class Imports
import { SeedAuthClass } from './auth/auth.class'
import { SeedProductAttributeClass } from './product-attribute/product-attribute.class'
import { SeedProductBrandClass } from './product-brand/product-brand.class'
import { SeedProductCategoryClass } from './product-category/product-category.class'
import { SeedProductCollectionClass } from './product-collection/product-collection.class'
import { SeedProductFlashDealsClass } from './product-flash-deals/product-flash-deals.class'
import { SeedProductClass } from './product/product.class'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'

export const seed = new Elysia({ prefix: '/seed' })
    .use(redisPlugin)
    .decorate({
        SeedAuthClass: new SeedAuthClass(),
        SeedProductCategoryClass: new SeedProductCategoryClass(),
        SeedProductBrandClass: new SeedProductBrandClass(),
        SeedProductAttributeClass: new SeedProductAttributeClass(),
        SeedProductClass: new SeedProductClass(),
        SeedProductCollectionClass: new SeedProductCollectionClass(),
        SeedProductFlashDealsClass: new SeedProductFlashDealsClass()
    })
    .get(
        '/',
        async ({
            redis,
            SeedAuthClass,
            SeedProductCategoryClass,
            SeedProductBrandClass,
            SeedProductAttributeClass,
            SeedProductClass,
            SeedProductCollectionClass,
            SeedProductFlashDealsClass
        }) => {
            await redis.forgetAll()
            await SeedAuthClass.authSeedCreate()
            await SeedProductCategoryClass.productCategorySeedCreate()
            await SeedProductBrandClass.productBrandSeedCreate()
            await SeedProductAttributeClass.productAttributeSeedCreate()
            await SeedProductClass.productSeedCreate()
            await SeedProductCollectionClass.productCollectionSeedCreate()
            await SeedProductFlashDealsClass.productFlashDealsSeedCreate()

            return { message: 'Seed data created successfully' }
        }
    )
