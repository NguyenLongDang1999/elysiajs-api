// ** Database Imports
import {
    productSchema,
    productVariantsSchema,
} from '@db/schema/product'
import { db } from '@src/database/drizzle'

// ** Types Imports
import { IProductSearchDTO } from './product.type'

// ** Drizzle Imports
import { and, count, eq, ilike, inArray, SQL } from 'drizzle-orm'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Types Imports

export class ProductService {
    async getTableList(query: IProductSearchDTO) {
        try {
            const where: SQL[] = [eq(productSchema.deleted_flg, false)]

            if (query.sku) {
                where.push(
                    inArray(
                        productVariantsSchema.sku,
                        db
                            .select({ sku: productVariantsSchema.sku })
                            .from(productVariantsSchema)
                            .where(eq(productVariantsSchema.sku, query.sku))
                    )
                )
            }

            if (query.name) {
                where.push(ilike(productSchema.name, `%${query.name}%`))
            }

            if (query.product_category_id) {
                where.push(eq(productSchema.product_category_id, query.product_category_id))
            }

            if (query.product_brand_id) {
                where.push(eq(productSchema.product_brand_id, query.product_brand_id))
            }

            if (query.status) {
                where.push(eq(productSchema.status, Number(query.status)))
            }

            if (query.product_type) {
                where.push(eq(productSchema.product_type, Number(query.product_type)))
            }

            const [data, [aggregations]] = await Promise.all([
                db.query.productSchema.findMany({
                    offset: query.page,
                    limit: query.pageSize,
                    orderBy: (product, { desc }) => [desc(product.created_at)],
                    where: and(...where),
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        created_at: true,
                        image_uri: true,
                        product_type: true
                    },
                    with: {
                        productCategory: {
                            columns: {
                                id: true,
                                name: true,
                                image_uri: true
                            }
                        },
                        productBrand: {
                            columns: {
                                id: true,
                                name: true,
                                image_uri: true
                            }
                        },
                        productVariants: {
                            orderBy: (productVariants, { desc }) => [desc(productVariants.created_at)],
                            where: eq(productVariantsSchema.is_default, true),
                            columns: {
                                sku: true,
                                price: true,
                                special_price: true,
                                special_price_type: true,
                            }
                        }
                    }
                }),
                db
                    .select({
                        value: count(productSchema.id)
                    })
                    .from(productSchema)
                    .where(and(...where))
            ])



            return {
                data: data,
                aggregations: aggregations.value
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    // async create(data: IProductDTO) {
    //     try {
    //         return await db.transaction(async (tx) => {
    //             const [product] = await tx
    //                 .insert(productSchema)
    //                 .values(data)
    //                 .returning({ id: productSchema.id })

    //             if (data.product_category_id.length) {
    //                 await tx.insert(productCategoryAttributeSchema).values(
    //                     data.product_category_id.map((product_category_id) => ({
    //                         product_attribute_id: product.id,
    //                         product_category_id
    //                     }))
    //                 )
    //             }

    //             if (data.product_attribute_values.length) {
    //                 await tx.insert(productValuesSchema).values(
    //                     data.product_attribute_values.map((value) => ({
    //                         product_attribute_id: product.id,
    //                         value: value.value
    //                     }))
    //                 )
    //             }

    //             return product
    //         })
    //     } catch (error) {
    //         handleDatabaseError(error)
    //     }
    // }

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
    //                     slug: slugTimestamp(query.slug!)
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
}
