// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import {
    IProductImagesDTO,
    IProductRelationsDTO,
    IProductSearchDTO,
    IProductSingleDTO,
    IProductUpdateGeneralVariantDTO,
    IProductVariantsDTO
} from './product.type'

// ** Utils Imports
import { MANAGE_INVENTORY, PRODUCT_TYPE, RELATIONS_TYPE, STATUS } from '@src/utils/enums'
import { handleDatabaseError } from '@utils/error-handling'

export class ProductService {
    async getTableList(query: IProductSearchDTO) {
        try {
            const take = Number(query.pageSize) || undefined
            const skip = Number(query.page) || undefined

            const search: Prisma.ProductWhereInput = {
                deleted_flg: false,
                sku: { contains: query.sku || undefined, mode: 'insensitive' },
                name: { contains: query.name || undefined, mode: 'insensitive' },
                status: { equals: Number(query.status) || undefined },
                product_type: { equals: Number(query.product_type) || undefined },
                product_brand_id: { equals: query.product_brand_id || undefined },
                product_category_id: { equals: query.product_category_id || undefined }
            }

            if (query.not_flash_deals && this.stringToBoolean(query.not_flash_deals)) {
                search.flashDealProducts = {
                    none: {
                        AND: [
                            {},
                            {
                                product_id: {
                                    notIn: query.product_id_flash_deals ? query.product_id_flash_deals.split(',') : []
                                }
                            }
                        ]
                    }
                }
            }

            if (query.product_id_collection) {
                search.productCollectionProduct = {
                    some: {
                        product_id: {
                            in: query.product_id_collection ? query.product_id_collection.split(',') : []
                        }
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
                        sku: true,
                        name: true,
                        slug: true,
                        status: true,
                        image_uri: true,
                        product_type: true,
                        price: true,
                        special_price: true,
                        special_price_type: true,
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
                                }
                            },
                            select: {
                                flashDeal: {
                                    select: {
                                        title: true,
                                        discounted_price: true,
                                        discounted_price_type: true
                                    }
                                }
                            }
                        }
                    }
                }),
                prismaClient.product.count({ where: search })
            ])

            return {
                data: data.map((productItem) => {
                    return {
                        ...productItem,
                        ...productItem.flashDealProducts[0]?.flashDeal,
                        hasFlashDeals: !!productItem.flashDealProducts.length,
                        flashDealProducts: undefined,
                        productVariants: undefined
                    }
                }),
                aggregations: count
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async createSingle(data: IProductSingleDTO) {
        try {
            const { quantity, manage_inventory, ...productData } = data
            const hasProductInventory = manage_inventory === MANAGE_INVENTORY.YES && quantity

            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.product.create({
                    data: {
                        ...productData,
                        product_type: PRODUCT_TYPE.SINGLE,
                        productVariants: {
                            create: [
                                {
                                    manage_inventory,
                                    productPrices: {
                                        create: {
                                            start_date: new Date(),
                                            is_default: true,
                                            price: data.price,
                                            special_price: data.special_price,
                                            special_price_type: data.special_price_type
                                        }
                                    },
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
            const variantDefault = product_variants.find((productVariantItem) => productVariantItem.is_default)

            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.product.create({
                    data: {
                        ...productData,
                        price: variantDefault?.price,
                        special_price: variantDefault?.special_price,
                        special_price_type: variantDefault?.special_price_type,
                        product_type: PRODUCT_TYPE.VARIANT,
                        productVariants: {
                            create: product_variants.map((productVariantItem) => ({
                                label: productVariantItem.label,
                                manage_inventory: productVariantItem.manage_inventory,
                                productVariantAttributeValues: {
                                    create: productVariantItem.product_attribute_value_id.map(
                                        (attributeValueItem: string) => ({
                                            product_attribute_value_id: attributeValueItem
                                        })
                                    )
                                },
                                productPrices: {
                                    create: {
                                        is_default: productVariantItem.is_default,
                                        price: productVariantItem.price,
                                        special_price: productVariantItem.special_price,
                                        special_price_type: productVariantItem.special_price_type,
                                        start_date: new Date()
                                    }
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

    async retrieve(id: string) {
        try {
            const product = await prismaClient.product.findFirst({
                where: {
                    id,
                    deleted_flg: false
                },
                select: {
                    id: true,
                    sku: true,
                    name: true,
                    slug: true,
                    status: true,
                    image_uri: true,
                    description: true,
                    short_description: true,
                    meta_title: true,
                    meta_description: true,
                    product_type: true,
                    technical_specifications: true,
                    product_brand_id: true,
                    product_category_id: true,
                    price: true,
                    special_price: true,
                    special_price_type: true,
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
                            // is_default: true,
                            label: true,
                            manage_inventory: true,
                            // price: true,
                            // special_price: true,
                            // special_price_type: true,
                            productInventory: {
                                select: {
                                    quantity: true
                                }
                            },
                            productPrices: {
                                select: {
                                    is_default: true,
                                    price: true,
                                    special_price: true,
                                    special_price_type: true
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

            product?.productVariants.forEach(({ productVariantAttributeValues }) => {
                productVariantAttributeValues.forEach(({ productAttributeValues }) => {
                    const { productAttribute: attribute, id: attributeValueId } = productAttributeValues

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

            const productPrice = product?.productVariants.find((variantItem) => variantItem.productPrices[0].is_default)

            const isProductSingle = product?.product_type === PRODUCT_TYPE.SINGLE

            return {
                ...product,
                ...(productPrice ? productPrice.productInventory : undefined),
                manage_inventory: product?.productVariants[0].manage_inventory,
                product_attribute_id: !isProductSingle ? product_attributes.map((_product) => _product.id) : undefined,
                product_attributes,
                product_images: product?.productImages,
                product_variants: !isProductSingle
                    ? product?.productVariants.map((variantItem) => ({
                        ...variantItem,
                        ...variantItem.productPrices[0],
                        productPrices: undefined,
                        productVariantAttributeValues: undefined,
                        quantity: variantItem.productInventory?.quantity || 0
                    }))
                    : undefined,
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
                productVariantAttributeValues: undefined
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

    async updateSingle(id: string, data: IProductSingleDTO) {
        try {
            const { quantity: _quantity, manage_inventory: _manage_inventory, ...productData } = data

            const product = await prismaClient.product.update({
                where: { id },
                data: {
                    ...productData
                },
                select: {
                    productVariants: {
                        where: {
                            deleted_flg: false
                        },
                        select: {
                            productPrices: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            })

            await prismaClient.productPrices.update({
                where: {
                    id: product.productVariants[0].productPrices[0].id
                },
                data: {
                    price: data.price,
                    special_price: data.special_price,
                    special_price_type: data.special_price_type
                }
            })

            return { id }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async updateVariants(id: string, data: IProductUpdateGeneralVariantDTO) {
        try {
            return await prismaClient.product.update({
                where: { id },
                data,
                select: {
                    id: true
                }
            })
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
