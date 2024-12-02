// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Third Party Imports
import { faker } from '@faker-js/faker'

export class SeedProductCategoryClass {
    async productCategorySeedCreate() {
        // First clear existing categories
        await prismaClient.productCategory.deleteMany()

        // Create 10 parent categories (1, 2, 3, ...)
        await prismaClient.productCategory.createMany({
            data: Array.from({ length: 10 }, (_, i) => ({
                name: `Product Category ${i + 1}`,
                slug: `product-category-${i + 1}`,
                description: `Main category ${i + 1}`,
                image_uri: faker.image.url(),
                meta_title: `Product Category ${i + 1}`,
                meta_description: `Description for product category ${i + 1}`,
                status: 10
            }))
        })

        // Get all parent categories
        const allParents = await prismaClient.productCategory.findMany()

        // For each parent, create 10 children (1.1, 1.2, 1.3, ...)
        for (const parent of allParents) {
            await prismaClient.productCategory.createMany({
                data: Array.from({ length: 10 }, (_, i) => ({
                    name: `${parent.name}.${i + 1}`,
                    slug: `product-category-${parent.slug}-${i + 1}`,
                    description: `Subcategory ${parent.name}.${i + 1}`,
                    image_uri: faker.image.url(),
                    meta_title: `Product Category ${parent.name}.${i + 1}`,
                    meta_description: `Description for product category ${parent.name}.${i + 1}`,
                    status: 10,
                    parent_id: parent.id
                }))
            })

            // Get all children for this parent
            const childCategories = await prismaClient.productCategory.findMany({
                where: { parent_id: parent.id }
            })

            // For each child, create 10 grandchildren (1.1.1, 1.1.2, ...)
            for (const child of childCategories) {
                await prismaClient.productCategory.createMany({
                    data: Array.from({ length: 10 }, (_, i) => ({
                        name: `${child.name}.${i + 1}`,
                        slug: `product-category-${child.slug}-${i + 1}`.replace('.', '-'),
                        description: `Subcategory ${child.name}.${i + 1}`,
                        image_uri: faker.image.url(),
                        meta_title: `Product Category ${child.name}.${i + 1}`,
                        meta_description: `Description for product category ${child.name}.${i + 1}`,
                        status: 10,
                        parent_id: child.id
                    }))
                })
            }
        }

        // Return count of created categories
        const totalCount = await prismaClient.productCategory.count()
        return {
            message: 'Product categories created successfully',
            totalCategories: totalCount,
            structure: {
                parentCategories: 10,
                childrenPerParent: 10,
                grandchildrenPerChild: 10
            }
        }
    }
}
