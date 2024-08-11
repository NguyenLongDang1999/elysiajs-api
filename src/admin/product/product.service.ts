// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import {
    IGenerateVariantDTO,
    IProductImagesDTO,
    IProductRelationsDTO,
    IProductSearchDTO,
    IProductSingleDTO,
    IProductVariantsDTO
} from './product.type'

// ** Utils Imports
import { MANAGE_INVENTORY, PRODUCT_TYPE, RELATIONS_TYPE, SPECIAL_PRICE_TYPE, STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductService {
    async getTableList(query: IProductSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductWhereInput = {
                deleted_flg: false,
                name: { contains: query.name || undefined, mode: 'insensitive' },
                status: { equals: Number(query.status) || undefined },
                product_type: { equals: Number(query.product_type) || undefined },
                product_brand_id: { equals: query.product_brand_id || undefined },
                product_category_id: { equals: query.product_category_id || undefined },
                productVariants: query.sku
                    ? {
                        every: {
                            sku: { contains: query.sku, mode: 'insensitive' }
                        }
                    }
                    : undefined
            }

            if (query.not_flash_deals && this.stringToBoolean(query.not_flash_deals)) {
                search.productVariants = {
                    ...search.productVariants,
                    none: {
                        AND: [
                            {
                                flashDealProducts: {
                                    some: {}
                                }
                            },
                            {
                                product_id: {
                                    notIn: query.product_id_flash_deals ? query.product_id_flash_deals.split(',') : []
                                }
                            }
                        ]
                    }
                }
            }

            const [data, count] = await Promise.all([
                prismaClient.product.findMany({
                    take,
                    skip,
                    orderBy: { created_at: 'desc' },
                    where: search,
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        status: true,
                        image_uri: true,
                        product_type: true,
                        productCategory: {
                            select: {
                                id: true,
                                name: true,
                                image_uri: true
                            }
                        },
                        productBrand: {
                            select: {
                                id: true,
                                name: true,
                                image_uri: true
                            }
                        },
                        productVariants: {
                            orderBy: { created_at: 'desc' },
                            where: { is_default: true },
                            select: {
                                sku: true,
                                price: true,
                                special_price: true,
                                special_price_type: true,
                                flashDealProducts: {
                                    where: {
                                        flashDeal: {
                                            deleted_flg: false,
                                            status: STATUS.ACTIVE,
                                            start_time: {
                                                lte: new Date()
                                            },
                                            end_time: {
                                                gte: new Date()
                                            }
                                        },
                                        productVariants: {
                                            deleted_flg: false,
                                            is_default: true
                                        }
                                    },
                                    select: {
                                        price: true,
                                        special_price: true,
                                        special_price_type: true
                                    }
                                }
                            }
                        }
                    }
                }),
                prismaClient.product.count({ where: search })
            ])

            return {
                data: data.map((productItem) => ({
                    ...productItem,
                    ...(productItem.productVariants[0].flashDealProducts.length
                        ? productItem.productVariants[0].flashDealProducts[0]
                        : productItem.productVariants.map(({ flashDealProducts: _, ..._p }) => _p)[0]),
                    hasFlashDeals: !!productItem.productVariants[0].flashDealProducts.length,
                    productVariants: undefined
                })),
                aggregations: count
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async createSingle(data: IProductSingleDTO) {
        try {
            const { sku, quantity, manage_inventory, ...productData } = data
            const hasProductInventory = manage_inventory === MANAGE_INVENTORY.YES && quantity

            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.product.create({
                    data: {
                        ...productData,
                        product_type: PRODUCT_TYPE.SINGLE,
                        productVariants: {
                            create: [
                                {
                                    is_default: true,
                                    sku: sku,
                                    manage_inventory,
                                    price: data.price,
                                    special_price: data.special_price,
                                    special_price_type: data.special_price_type,
                                    productInventory: hasProductInventory
                                        ? { create: { quantity: quantity } }
                                        : undefined
                                }
                            ]
                        }
                    },
                    select: { id: true }
                })
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async createVariants(data: IProductVariantsDTO) {
        try {
            const { product_variants, ...productData } = data

            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.product.create({
                    data: {
                        ...productData,
                        product_type: PRODUCT_TYPE.VARIANT,
                        productVariants: {
                            create: product_variants.map((productVariantItem) => ({
                                is_default: productVariantItem.is_default,
                                label: productVariantItem.label,
                                sku: productVariantItem.sku as string,
                                manage_inventory: productVariantItem.manage_inventory,
                                price: productVariantItem.price,
                                special_price: productVariantItem.special_price,
                                special_price_type: productVariantItem.special_price_type,
                                productVariantAttributeValues: {
                                    create: productVariantItem.product_attribute_value_id.map(
                                        (attributeValueItem: string) => ({
                                            product_attribute_value_id: attributeValueItem
                                        })
                                    )
                                },
                                productInventory: {
                                    create:
                                        productVariantItem.manage_inventory === MANAGE_INVENTORY.YES
                                            ? { quantity: productVariantItem.quantity as number }
                                            : undefined
                                }
                            }))
                        }
                    },
                    select: { id: true }
                })
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    // async update(id: string, data: IProductDTO) {
    //     try {
    //         return await db.transaction(async (tx) => {
    //             const [product] = await tx
    //                 .update(productSchema)
    //                 .set(data)
    //                 .where(eq(productSchema.id, id))
    //                 .returning({ id: productSchema.id })

    //             await tx.delete(productCategoryAttributeSchema).where(eq(productCategoryAttributeSchema.product_attribute_id, id))

    //             const productCategoryAttributes = data.product_category_id.map((product_category_id) => ({
    //                 product_attribute_id: product.id,
    //                 product_category_id
    //             }))

    //             await tx.insert(productCategoryAttributeSchema).values(productCategoryAttributes)

    //             const existingOptions = await db.query.productValuesSchema.findMany({
    //                 where: and(eq(productValuesSchema.product_attribute_id, id)),
    //             })

    //             const existingOptionsMap = new Map(existingOptions.map((option) => [option.id, option]))

    //             for (const option of data.product_attribute_values) {
    //                 const existingOption = existingOptionsMap.get(option.id)

    //                 if (existingOption) {
    //                     await tx
    //                         .update(productValuesSchema)
    //                         .set({
    //                             value: option.value
    //                         })
    //                         .where(eq(productValuesSchema.id, existingOption.id))
    //                         .returning({ id: productValuesSchema.id })

    //                     existingOptionsMap.delete(option.id)
    //                 } else {
    //                     await tx.insert(productValuesSchema).values({
    //                         value: option.value,
    //                         product_attribute_id: id
    //                     })
    //                 }
    //             }

    //             if (existingOptionsMap.size > 0) {
    //                 await tx.delete(productValuesSchema)
    //                     .where(
    //                         inArray(
    //                             productValuesSchema.id,
    //                             Array.from(existingOptionsMap.keys())
    //                         )
    //                     )
    //             }

    //             return product
    //         })
    //     } catch (error) {
    //         handleDatabaseError(error)
    //     }
    // }

    async retrieve(id: string) {
        try {
            const product = await prismaClient.product.findFirst({
                where: {
                    id,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    image_uri: true,
                    description: true,
                    short_description: true,
                    product_type: true,
                    meta_title: true,
                    meta_description: true,
                    technical_specifications: true,
                    total_rating: true,
                    product_brand_id: true,
                    product_category_id: true,
                    productImages: {
                        orderBy: { index: 'asc' },
                        select: {
                            id: true,
                            image_uri: true
                        }
                    },
                    productRelated: {
                        where: {
                            product: {
                                deleted_flg: false
                            }
                        },
                        select: {
                            related_product_id: true,
                            relation_type: true
                        }
                    },
                    productVariants: {
                        orderBy: { created_at: 'desc' },
                        select: {
                            is_default: true,
                            label: true,
                            sku: true,
                            manage_inventory: true,
                            price: true,
                            special_price: true,
                            special_price_type: true,
                            productInventory: {
                                select: {
                                    quantity: true
                                }
                            },
                            productVariantAttributeValues: {
                                where: {
                                    productAttributeValues: {
                                        deleted_flg: false,
                                        productAttribute: {
                                            deleted_flg: false
                                        }
                                    }
                                },
                                select: {
                                    productAttributeValues: {
                                        select: {
                                            id: true,
                                            value: true,
                                            productAttribute: {
                                                select: {
                                                    id: true,
                                                    name: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            const product_attributes: {
                id: string
                name: string
                values: string[]
            }[] = []

            product?.productVariants.forEach((variant) => {
                variant.productVariantAttributeValues.forEach((variantAttrValue) => {
                    const attribute = variantAttrValue.productAttributeValues.productAttribute
                    const attributeValueId = variantAttrValue.productAttributeValues.id

                    const attrObj = product_attributes.find((attr) => attr.id === attribute.id)

                    if (attrObj) {
                        attrObj.values.push(attributeValueId)
                    } else {
                        product_attributes.push({
                            id: attribute.id,
                            name: attribute.name,
                            values: [attributeValueId]
                        })
                    }
                })
            })

            const productPrice = product?.productVariants.filter((variantItem) => variantItem.is_default)

            return {
                ...product,
                ...(productPrice ? productPrice[0] : undefined),
                ...(productPrice ? productPrice[0].productInventory : undefined),
                product_attributes,
                product_images: product?.productImages,
                product_variants: product?.productVariants.map((variantItem) => ({
                    ...variantItem,
                    quantity: variantItem.productInventory?.quantity || 0
                })),
                product_upsell: product?.productRelated
                    .filter((relatedItem) => relatedItem.relation_type === RELATIONS_TYPE.UPSELL)
                    .map((relatedItem) => relatedItem.related_product_id),
                product_cross_sell: product?.productRelated
                    .filter((relatedItem) => relatedItem.relation_type === RELATIONS_TYPE.CROSS_SELL)
                    .map((relatedItem) => relatedItem.related_product_id),
                product_related: product?.productRelated
                    .filter((relatedItem) => relatedItem.relation_type === RELATIONS_TYPE.RELATED)
                    .map((relatedItem) => relatedItem.related_product_id),
                productImages: undefined,
                productRelated: undefined,
                productVariants: undefined,
                productVariantAttributeValues: undefined,
                technical_specifications:
                    typeof product?.technical_specifications === 'string'
                        ? JSON.parse(product.technical_specifications)
                        : []
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    // async delete(id: string, query: IDeleteDTO) {
    //     try {
    //         if (query.force) {
    //             return db.delete(productSchema).where(eq(productSchema.id, id))
    //         } else {
    //             return await db
    //                 .update(productSchema)
    //                 .set({
    //                     deleted_flg: true,
    //                     slug: slugTimestamp(query.slug as string)
    //                 })
    //                 .where(eq(productSchema.id, id))
    //                 .returning({
    //                     id: productSchema.id
    //                 })
    //         }
    //     } catch (error) {
    //         handleDatabaseError(error)
    //     }
    // }

    async generateVariant(generateProductDto: IGenerateVariantDTO) {
        try {
            const { product_id } = generateProductDto

            const product = await prismaClient.product.findMany({
                where: {
                    deleted_flg: false,
                    id: { in: product_id }
                },
                select: {
                    id: true,
                    name: true,
                    image_uri: true,
                    product_type: true,
                    productVariants: {
                        where: { deleted_flg: false },
                        select: {
                            id: true,
                            sku: true,
                            label: true
                        }
                    }
                }
            })

            return product.map((_p) => ({
                ..._p,
                productVariants: _p.productVariants.map((_pv) => ({
                    ..._pv,
                    price: 0,
                    special_price: 0,
                    special_price_type: SPECIAL_PRICE_TYPE.PRICE
                }))
            }))
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async updateRelations(id: string, data: IProductRelationsDTO) {
        try {
            const productData = data.product_id.map((_d) => ({
                product_id: id,
                related_product_id: _d,
                relation_type: data.product_relation_type
            }))

            await prismaClient.productRelations.deleteMany({
                where: {
                    product_id: id,
                    relation_type: data.product_relation_type
                }
            })

            return await prismaClient.productRelations.createMany({
                data: productData,
                skipDuplicates: true
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async updateImages(id: string, data: IProductImagesDTO) {
        try {
            await prismaClient.$transaction(async (prisma) => {
                const filteredProductImages = data.product_images.filter((img) => Object.keys(img).length > 0)
                const productImagesToUpdate = filteredProductImages.filter((imageItem) => imageItem.id)
                const productImagesToCreate = filteredProductImages.filter((imageItem) => !imageItem.id)

                const updateOperations = productImagesToUpdate.map((productImage, index) => ({
                    where: { id: productImage.id },
                    data: {
                        index,
                        image_uri: productImage.image_uri || ''
                    }
                }))

                const createOperation = {
                    data: productImagesToCreate.map((imageItem, index) => ({
                        product_id: id,
                        index,
                        image_uri: imageItem.image_uri || ''
                    })),
                    skipDuplicates: true
                }

                await prisma.product.update({
                    where: { id },
                    data: {
                        image_uri: data.image_uri
                    }
                })

                for (const operation of updateOperations) {
                    await prisma.productImages.update(operation)
                }

                if (createOperation.data.length > 0) {
                    await prisma.productImages.createMany(createOperation)
                }
            })

            return { id }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    stringToBoolean = (str: string) => JSON.parse(str)
}
