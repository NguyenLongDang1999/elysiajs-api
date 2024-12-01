// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Third Party Imports

export class SeedProductFlashDealsClass {
    async productFlashDealsSeedCreate() {
        // First, ensure we have some products in the database to reference
        const products = await prismaClient.product.findMany({
            take: 20 // Get first 20 products to randomly assign to flash deals
        })

        if (products.length === 0) {
            console.error('Please seed products first!')
            return
        }

        // Create 10 flash deals
        const flashDeals = [
            {
                title: 'Summer Clearance Sale',
                slug: 'summer-clearance-2024',
                description: 'Massive discounts on summer collection',
                status: 20, // Active
                discounted_price: 30,
                discounted_price_type: 20, // Percentage
                start_time: new Date('2024-06-01'),
                end_time: new Date('2024-06-07')
            },
            {
                title: 'Flash Friday',
                slug: 'flash-friday-march',
                description: '24 hours of incredible savings',
                status: 10, // Draft
                discounted_price: 50000,
                discounted_price_type: 10, // Fixed amount
                start_time: new Date('2024-03-15'),
                end_time: new Date('2024-03-16')
            },
            {
                title: 'Weekend Special',
                slug: 'weekend-special-march',
                description: 'Special weekend offers',
                status: 20,
                discounted_price: 25,
                discounted_price_type: 20,
                start_time: new Date('2024-03-23'),
                end_time: new Date('2024-03-24')
            },
            {
                title: 'Midnight Madness',
                slug: 'midnight-madness-april',
                description: 'Crazy midnight deals',
                status: 20,
                discounted_price: 40,
                discounted_price_type: 20,
                start_time: new Date('2024-04-01'),
                end_time: new Date('2024-04-02')
            },
            {
                title: 'Easter Special',
                slug: 'easter-special-2024',
                description: 'Easter weekend sale',
                status: 20,
                discounted_price: 100000,
                discounted_price_type: 10,
                start_time: new Date('2024-03-31'),
                end_time: new Date('2024-04-01')
            },
            {
                title: 'Tech Tuesday',
                slug: 'tech-tuesday-march',
                description: 'Amazing deals on electronics',
                status: 20,
                discounted_price: 35,
                discounted_price_type: 20,
                start_time: new Date('2024-03-19'),
                end_time: new Date('2024-03-20')
            },
            {
                title: 'Spring Collection Launch',
                slug: 'spring-launch-2024',
                description: 'New spring collection with special prices',
                status: 10,
                discounted_price: 20,
                discounted_price_type: 20,
                start_time: new Date('2024-04-15'),
                end_time: new Date('2024-04-20')
            },
            {
                title: 'Mother\'s Day Special',
                slug: 'mothers-day-2024',
                description: 'Special offers for Mother\'s Day',
                status: 20,
                discounted_price: 200000,
                discounted_price_type: 10,
                start_time: new Date('2024-05-10'),
                end_time: new Date('2024-05-12')
            },
            {
                title: 'Clearance Sale',
                slug: 'clearance-sale-april',
                description: 'End of season clearance',
                status: 20,
                discounted_price: 45,
                discounted_price_type: 20,
                start_time: new Date('2024-04-25'),
                end_time: new Date('2024-04-30')
            },
            {
                title: 'Premium Friday',
                slug: 'premium-friday-march',
                description: 'Exclusive deals on premium products',
                status: 20,
                discounted_price: 150000,
                discounted_price_type: 10,
                start_time: new Date('2024-03-29'),
                end_time: new Date('2024-03-30')
            }
        ]

        // Insert flash deals
        for (const deal of flashDeals) {
            const createdDeal = await prismaClient.flashDeals.create({
                data: deal
            })

            // Randomly assign 2-4 products to each flash deal
            const numProducts = Math.floor(Math.random() * 3) + 2
            const randomProducts = products
                .sort(() => Math.random() - 0.5)
                .slice(0, numProducts)

            // Create flash deal product associations
            for (const product of randomProducts) {
                await prismaClient.flashDealProducts.create({
                    data: {
                        flash_deal_id: createdDeal.id,
                        product_id: product.id
                    }
                })
            }
        }
    }
}
