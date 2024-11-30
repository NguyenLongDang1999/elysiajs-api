// ** Prisma Imports
import prismaClient from '@src/database/prisma'

export class SeedProductAttributeClass {
    async productAttributeSeedCreate() {
        try {
            // First clear existing data
            await prismaClient.productAttributeValues.deleteMany()
            await prismaClient.productCategoryAttributes.deleteMany()
            await prismaClient.productAttribute.deleteMany()

            // Create base attributes
            const attributes = await Promise.all([
                prismaClient.productAttribute.create({
                    data: {
                        name: 'Color',
                        slug: 'color',
                        description: 'Product color variations',
                        status: 10,
                    }
                }),
                prismaClient.productAttribute.create({
                    data: {
                        name: 'Size',
                        slug: 'size',
                        description: 'Product size variations',
                        status: 10,
                    }
                }),
                prismaClient.productAttribute.create({
                    data: {
                        name: 'Material',
                        slug: 'material',
                        description: 'Product material type',
                        status: 10,
                    }
                })
            ])

            // Create attribute values
            const attributeValues = await Promise.all([
                // Colors
                ...['Red', 'Blue', 'Black', 'White', 'Green'].map(color =>
                    prismaClient.productAttributeValues.create({
                        data: {
                            value: color,
                            product_attribute_id: attributes[0].id
                        }
                    })
                ),
                // Sizes
                ...['S', 'M', 'L', 'XL', 'XXL'].map(size =>
                    prismaClient.productAttributeValues.create({
                        data: {
                            value: size,
                            product_attribute_id: attributes[1].id
                        }
                    })
                ),
                // Materials
                ...['Cotton', 'Polyester', 'Leather', 'Wool', 'Silk'].map(material =>
                    prismaClient.productAttributeValues.create({
                        data: {
                            value: material,
                            product_attribute_id: attributes[2].id
                        }
                    })
                )
            ])

            // Get all categories
            const categories = await prismaClient.productCategory.findMany()

            // Create category-attribute relationships
            for (const category of categories) {
                // Randomly assign 1-3 attributes to each category
                const shuffledAttributes = [...attributes].sort(() => Math.random() - 0.5)
                const selectedAttributes = shuffledAttributes.slice(0, Math.floor(Math.random() * 3) + 1)

                for (const attribute of selectedAttributes) {
                    await prismaClient.productCategoryAttributes.create({
                        data: {
                            product_category_id: category.id,
                            product_attribute_id: attribute.id
                        }
                    })
                }
            }

            return {
                message: 'Product attributes created successfully',
                totalAttributes: attributes.length,
                totalAttributeValues: attributeValues.length,
                totalCategoryAttributes: await prismaClient.productCategoryAttributes.count()
            }

        } catch (error) {
            console.error('Error in productAttributeSeedCreate:', error)
            throw error
        }
    }
}
