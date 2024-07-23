// ** Prisma Imports
import { Prisma } from '@prisma/client'
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IProductDTO, IProductSearchDTO, IProductVariantDTO } from './product.type'

// ** Utils Imports
import { MANAGE_INVENTORY, PRODUCT_TYPE, STATUS } from '@src/utils/enums'
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

    async create(data: IProductDTO) {
        try {
            const { sku, quantity, manage_inventory, product_variants, ...productData } = data

            function createProductVariant(productVariantItem: IProductVariantDTO) {
                return {
                    is_default: productVariantItem.is_default,
                    label: productVariantItem.label,
                    sku: productVariantItem.sku,
                    manage_inventory: productVariantItem.manage_inventory,
                    price: productVariantItem.price,
                    special_price: productVariantItem.special_price,
                    special_price_type: productVariantItem.special_price_type,
                    productVariantAttributeValues: {
                        create: productVariantItem.product_attribute_value_id.map((attributeValueItem: string) => ({
                            product_attribute_value_id: attributeValueItem
                        }))
                    },
                    productInventory: {
                        create:
                            productVariantItem.manage_inventory === MANAGE_INVENTORY.YES
                                ? { quantity: productVariantItem.quantity }
                                : undefined
                    }
                }
            }

            const productVariants = product_variants
                ? product_variants.map(createProductVariant)
                : [
                    {
                        is_default: true,
                        sku,
                        manage_inventory,
                        price: data.price,
                        special_price: data.special_price,
                        special_price_type: data.special_price_type,
                        productInventory:
                            manage_inventory === MANAGE_INVENTORY.YES
                                ? {
                                    create: { quantity }
                                }
                                : undefined
                    }
                ]

            const product_type = product_variants ? PRODUCT_TYPE.VARIANT : PRODUCT_TYPE.SINGLE

            return await prismaClient.$transaction(async (prisma) => {
                return await prisma.product.create({
                    data: {
                        ...productData,
                        product_type,
                        productVariants: {
                            create: productVariants
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

    // async retrieve(id: string) {
    //     try {
    //         const product = await db.query.productSchema.findFirst({
    //             where: and(eq(productSchema.id, id), eq(productSchema.deleted_flg, false)),
    //             columns: {
    //                 id: true,
    //                 name: true,
    //                 slug: true,
    //                 status: true,
    //                 description: true,
    //             },
    //             with: {
    //                 productValues: {
    //                     columns: {
    //                         id: true,
    //                         value: true
    //                     }
    //                 },
    //                 productCategoryAttributes: {
    //                     columns: {
    //                         product_category_id: true
    //                     }
    //                 }
    //             }
    //         })

    //         return {
    //             ...product,
    //             product_category_id: product?.productCategoryAttributes.map(
    //                 ({ product_category_id }) => product_category_id,
    //             ),
    //             product_attribute_values: product?.productValues.map((valueItem) => valueItem),
    //         }
    //     } catch (error) {
    //         handleDatabaseError(error)
    //     }
    // }

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

    stringToBoolean = (str: string) => JSON.parse(str)
}
