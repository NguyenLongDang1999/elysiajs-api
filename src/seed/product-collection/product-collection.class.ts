// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Third Party Imports
import { faker } from '@faker-js/faker'

export class SeedProductCollectionClass {
    async productCollectionSeedCreate() {
        // First, get all product IDs to randomly assign to collections
        const products = await prismaClient.product.findMany({
            select: { id: true }
        })

        // Create 10 collections
        for (let i = 0; i < 10; i++) {
            const title = faker.commerce.department()
            const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`

            // Create the collection
            const collection = await prismaClient.productCollection.create({
                data: {
                    title,
                    slug,
                    status: 10 // Active status
                }
            })

            // Randomly select 20 products for this collection
            const selectedProducts = faker.helpers.shuffle(products).slice(0, 20)

            // Create product-collection relationships
            await prismaClient.productCollectionProduct.createMany({
                data: selectedProducts.map(product => ({
                    product_id: product.id,
                    product_collection_id: collection.id
                }))
            })
        }
    }
}
