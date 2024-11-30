// ** Prisma Imports
import { faker } from '@faker-js/faker'
import prismaClient from '@src/database/prisma'
import { MANAGE_INVENTORY, PRODUCT_TYPE, STATUS } from '@utils/enums'

export class SeedProductClass {
    private readonly PRODUCT_COUNT = 100

    private generateSku(index: number): string {
        return `SKU${String(index + 1).padStart(5, '0')}`
    }

    private async getRandomReferences() {
        // Get random category and brand IDs from existing data
        const [categories, brands, attributeValues] = await Promise.all([
            prismaClient.productCategory.findMany({ select: { id: true } }),
            prismaClient.productBrand.findMany({ select: { id: true } }),
            prismaClient.productAttributeValues.findMany({ select: { id: true } })
        ])

        return {
            categoryIds: categories.map(c => c.id),
            brandIds: brands.map(b => b.id),
            attributeValueIds: attributeValues.map(av => av.id)
        }
    }

    async productSeedCreate() {
        try {
            console.log('🌱 Starting product seed...')

            const { categoryIds, brandIds, attributeValueIds } = await this.getRandomReferences()

            if (!categoryIds.length || !brandIds.length || !attributeValueIds.length) {
                throw new Error('Missing required reference data. Please seed categories, brands, and attribute values first.')
            }

            for (let i = 0; i < this.PRODUCT_COUNT; i++) {
                const isSingleProduct = faker.datatype.boolean()
                const basePrice = faker.number.int({ min: 1000, max: 1000000 })
                const hasSpecialPrice = faker.datatype.boolean()
                const specialPrice = hasSpecialPrice ? basePrice * 0.8 : undefined

                const productName = faker.commerce.productName()

                await prismaClient.product.create({
                    data: {
                        sku: this.generateSku(i),
                        name: productName,
                        slug: faker.helpers.slugify(`${productName}-${this.generateSku(i)}`).toLowerCase(),
                        image_uri: faker.image.url(),
                        short_description: faker.commerce.productDescription(),
                        description: `
                            <div class="product-description">
                                <h2>Product Overview</h2>
                                <p>${faker.commerce.productDescription()}</p>
                                
                                <h3>Key Features</h3>
                                <ul>
                                    ${Array.from({ length: faker.number.int({ min: 3, max: 6 }) })
                                .map(() => `<li>${faker.commerce.productDescription()}</li>`)
                                .join('')}
                                </ul>

                                <h3>Details</h3>
                                <p>${faker.lorem.paragraph()}</p>

                                <div class="specifications">
                                    <h3>Specifications</h3>
                                    <table>
                                        ${Array.from({ length: faker.number.int({ min: 3, max: 5 }) })
                                .map(() => `
                                                <tr>
                                                    <td><strong>${faker.commerce.productMaterial()}</strong></td>
                                                    <td>${faker.commerce.productDescription()}</td>
                                                </tr>
                                            `)
                                .join('')}
                                    </table>
                                </div>

                                <div class="care-instructions">
                                    <h3>Care Instructions</h3>
                                    <p>${faker.lorem.paragraph()}</p>
                                </div>
                            </div>
                        `,
                        technical_specifications: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() => ({
                            title: faker.commerce.productMaterial(),
                            content: faker.commerce.productDescription()
                        })),
                        product_category_id: faker.helpers.arrayElement(categoryIds),
                        product_brand_id: faker.helpers.arrayElement(brandIds),
                        status: STATUS.ACTIVE,
                        product_type: isSingleProduct ? PRODUCT_TYPE.SINGLE : PRODUCT_TYPE.VARIANT,
                        price: basePrice,
                        special_price: specialPrice,
                        special_price_type: hasSpecialPrice ? 10 : 20,
                        meta_title: productName,
                        meta_description: faker.commerce.productDescription(),
                        productImages: {
                            create: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map((_, imgIndex) => ({
                                image_uri: faker.image.url(),
                                index: imgIndex,
                            }))
                        },
                        productVariants: {
                            create: isSingleProduct
                                ? [{
                                    manage_inventory: MANAGE_INVENTORY.YES,
                                    productInventory: {
                                        create: {
                                            quantity: faker.number.int({ min: 0, max: 100 })
                                        }
                                    },
                                    productPrices: {
                                        create: {
                                            is_default: true,
                                            price: basePrice,
                                            special_price: specialPrice,
                                            special_price_type: hasSpecialPrice ? 10 : 20,
                                            start_date: new Date()
                                        }
                                    }
                                }]
                                : Array.from({ length: faker.number.int({ min: 2, max: 4 }) }).map((_, variantIndex) => {
                                    const variantPrice = basePrice + (faker.number.int({ min: -100000, max: 100000 }))

                                    // Get unique random attribute values for this variant
                                    const shuffledAttributeValues = [...attributeValueIds]
                                        .sort(() => Math.random() - 0.5)
                                        .slice(0, 2)

                                    return {
                                        label: `Variant ${variantIndex + 1}`,
                                        manage_inventory: MANAGE_INVENTORY.YES,
                                        productInventory: {
                                            create: {
                                                quantity: faker.number.int({ min: 0, max: 100 })
                                            }
                                        },
                                        productPrices: {
                                            create: {
                                                is_default: variantIndex === 0,
                                                price: variantPrice,
                                                special_price: hasSpecialPrice ? variantPrice * 0.8 : undefined,
                                                special_price_type: hasSpecialPrice ? 10 : 20,
                                                start_date: new Date()
                                            }
                                        },
                                        productVariantAttributeValues: {
                                            create: shuffledAttributeValues.map(attributeValueId => ({
                                                product_attribute_value_id: attributeValueId
                                            }))
                                        }
                                    }
                                })
                        }
                    }
                })

                if ((i + 1) % 10 === 0) {
                    console.log(`✅ Created ${i + 1} products`)
                }
            }

            console.log(`🎉 Successfully created ${this.PRODUCT_COUNT} products`)
        } catch (error) {
            console.error('❌ Error seeding products:', error)
            throw error
        }
    }
}
