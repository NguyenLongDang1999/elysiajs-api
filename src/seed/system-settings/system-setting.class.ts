// ** Prisma Imports
import prismaClient from '@src/database/prisma'

export class SeedSystemSettingClass {
    async systemSettingSeedCreate() {
        await prismaClient.systemSettings.deleteMany()

        const productCategories = await prismaClient.productCategory.findMany({
            select: { id: true }
        })

        const randomCategories = productCategories
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)

        const categoryIds = JSON.stringify(randomCategories.map(cat => cat.id))

        await prismaClient.systemSettings.create({
            data: {
                key: 'home_product_categories_popular',
                label: 'Home Product Categories Popular',
                value: categoryIds
            }
        })

        // Add home slider data
        const sliderData = [
            {
                image_uri: '/slider/electronics-banner.jpg',
                image_link: '/category/electronics'
            },
            {
                image_uri: '/slider/fashion-banner.jpg',
                image_link: '/category/fashion'
            },
            {
                image_uri: '/slider/home-decor-banner.jpg',
                image_link: '/category/home-decor'
            },
            {
                image_uri: '/slider/sports-banner.jpg',
                image_link: '/category/sports'
            },
            {
                image_uri: '/slider/beauty-banner.jpg',
                image_link: '/category/beauty'
            },
            {
                image_uri: '/slider/books-banner.jpg',
                image_link: '/category/books'
            }
        ]

        await prismaClient.systemSettings.create({
            data: {
                key: 'home_slider',
                label: 'Home Page Slider',
                value: JSON.stringify(sliderData)
            }
        })
    }
}
