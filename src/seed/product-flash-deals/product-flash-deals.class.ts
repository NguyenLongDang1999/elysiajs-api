// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Third Party Imports
import { faker } from '@faker-js/faker'

export class SeedProductFlashDealsClass {
    async productFlashDealsSeedCreate() {
        // First, delete all existing flash deals
        await prismaClient.flashDeals.deleteMany()

        // Get all product IDs from the database
        const products = await prismaClient.product.findMany({
            select: { id: true }
        })

        // Create 10 flash deals
        for (let i = 0; i < 10; i++) {
            const specialPriceType = faker.helpers.arrayElement([10, 20]) // 10: Fixed, 20: Percentage

            const specialPrice = specialPriceType === 20
                ? faker.number.int({ min: 10, max: 90 }) // Percentage discount (10-90%)
                : faker.number.int({ // Fixed discount
                    min: 10000,
                    max: 200000,
                    multipleOf: 1000
                })

            const startTime = faker.date.future()
            const endTime = new Date(startTime)
            endTime.setDate(startTime.getDate() + faker.number.int({ min: 1, max: 30 }))

            await prismaClient.flashDeals.create({
                data: {
                    title: faker.commerce.productName(),
                    slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
                    description: faker.commerce.productDescription(),
                    status: faker.helpers.arrayElement([10, 20]),
                    discounted_price: specialPrice,
                    discounted_price_type: specialPriceType, // 10: Fixed, 20: Percentage
                    start_time: startTime,
                    end_time: endTime,
                    // Create 20 flash deal products for each flash deal
                    flashDealProducts: {
                        create: faker.helpers.arrayElements(products, 20).map(product => ({
                            product_id: product.id
                        }))
                    }
                }
            })
        }
    }
}
