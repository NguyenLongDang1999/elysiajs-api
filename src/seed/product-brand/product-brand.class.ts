// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Third Party Imports
import { faker } from '@faker-js/faker'

export class SeedProductBrandClass {
    async productBrandSeedCreate() {
        try {
            // First clear existing relationships and brands
            await prismaClient.productCategoryBrand.deleteMany()
            await prismaClient.productBrand.deleteMany()

            // Create 100 brands
            const brands = await Promise.all(
                Array.from({ length: 100 }, async (_, i) => {
                    return await prismaClient.productBrand.create({
                        data: {
                            name: `Brand ${i + 1}`,
                            slug: `brand-${i + 1}`,
                            image_uri: faker.image.url(),
                            description: faker.company.catchPhrase(),
                            status: 10
                        }
                    })
                })
            )

            // Get all categories
            const categories = await prismaClient.productCategory.findMany()

            if (categories.length === 0) {
                throw new Error('No categories found. Please run category seeder first.')
            }

            // Create relationships
            for (const brand of brands) {
                // Randomly select 1-3 categories for each brand
                const numberOfCategories = Math.floor(Math.random() * 3) + 1
                const shuffledCategories = [...categories].sort(() => Math.random() - 0.5)
                const selectedCategories = shuffledCategories.slice(0, numberOfCategories)

                for (const category of selectedCategories) {
                    try {
                        await prismaClient.productCategoryBrand.create({
                            data: {
                                product_brand_id: brand.id,
                                product_category_id: category.id
                            }
                        })
                    } catch (error) {
                        // Skip if relationship already exists
                        continue
                    }
                }
            }

            const totalBrands = await prismaClient.productBrand.count()
            const totalRelationships = await prismaClient.productCategoryBrand.count()

            return {
                message: 'Product brands created successfully',
                totalBrands,
                totalRelationships
            }
        } catch (error) {
            throw error
        }
    }
}
