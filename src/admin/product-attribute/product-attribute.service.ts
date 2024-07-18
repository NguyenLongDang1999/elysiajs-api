// ** Database Imports
import {
    productAttributeSchema,
    productAttributeValuesSchema,
    productCategoryAttributeSchema
} from '@db/schema/product-attributes'
import { db } from '@src/database/drizzle'

// ** Types Imports
import { IProductAttributeDTO, IProductAttributeSearchDTO } from './product-attribute.type'

// ** Drizzle Imports
import { and, count, desc, eq, exists, ilike } from 'drizzle-orm'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Types Imports
import { productCategorySchema } from '@src/database/drizzle/schema'

export class ProductAttributeService {
    async getTableList(query: IProductAttributeSearchDTO) {
        try {
            const searchConditions = [
                eq(productAttributeSchema.deleted_flg, false),
                query.name ? ilike(productAttributeSchema.name, `%${query.name}%`) : undefined,
                query.status ? eq(productAttributeSchema.status, Number(query.status)) : undefined,
                query.product_category_id
                    ? exists(
                          db
                              .select()
                              .from(productCategoryAttributeSchema)
                              .where(
                                  and(
                                      eq(
                                          productCategoryAttributeSchema.product_attribute_id,
                                          productAttributeSchema.id
                                      ),
                                      eq(productCategoryAttributeSchema.product_category_id, query.product_category_id)
                                  )
                              )
                      )
                    : undefined
            ].filter(Boolean)

            const search = and(...searchConditions)

            const [data, aggregations] = await Promise.all([
                db
                    .select({
                        id: productAttributeSchema.id,
                        name: productAttributeSchema.name,
                        status: productAttributeSchema.status,
                        created_at: productAttributeSchema.created_at
                    })
                    .from(productAttributeSchema)
                    .where(search)
                    .orderBy(desc(productAttributeSchema.created_at))
                    .limit(Number(query.pageSize))
                    .offset(Number(query.page))
                    .prepare('fetchAttributes')
                    .execute(),
                db
                    .select({
                        value: count()
                    })
                    .from(productAttributeSchema)
                    .where(search)
                    .prepare('countAttribute')
                    .execute()
            ])

            const productCategoryAttributes = await Promise.all(
                data.map(async (item) => {
                    const categories = await db
                        .select({
                            productCategory: {
                                id: productCategorySchema.id,
                                name: productCategorySchema.name
                            }
                            // value: count()
                        })
                        .from(productCategoryAttributeSchema)
                        .leftJoin(
                            productCategorySchema,
                            eq(productCategoryAttributeSchema.product_category_id, productCategorySchema.id)
                        )
                        // .leftJoin(
                        //     productAttributeValuesSchema,
                        //     eq(productAttributeValuesSchema.product_attribute_id, productAttributeSchema.id)
                        // )
                        .where(
                            and(
                                eq(productCategoryAttributeSchema.product_attribute_id, item.id),
                                eq(productCategorySchema.deleted_flg, false)
                            )
                        )
                    return {
                        ...item,
                        productAttributeValues: [],
                        productCategoryAttributes: categories.map((categoryItem) => categoryItem.productCategory)
                    }
                })
            )

            return { data: productCategoryAttributes, aggregations: aggregations[0].value }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(data: IProductAttributeDTO) {
        try {
            return await db.transaction(async (tx) => {
                const [productAttribute] = await tx
                    .insert(productAttributeSchema)
                    .values(data)
                    .returning({ id: productAttributeSchema.id })

                await tx.insert(productCategoryAttributeSchema).values(
                    data.product_category_id.map((product_category_id) => ({
                        product_attribute_id: productAttribute.id,
                        product_category_id
                    }))
                )

                await tx.insert(productAttributeValuesSchema).values(
                    data.product_attribute_values.map((value) => ({
                        product_attribute_id: productAttribute.id,
                        value: value.value
                    }))
                )

                return productAttribute
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    // async update(id: string, data: IProductAttributeDTO) {
    //     try {
    //         return await db.update(productAttributeSchema).set(data).where(eq(productAttributeSchema.id, id)).returning({
    //             id: productAttributeSchema.id
    //         })
    //     } catch (error) {
    //         handleDatabaseError(error)
    //     }
    // }

    // async retrieve(id: string) {
    //     try {
    //         const productAttributeResult = await db
    //             .select({
    //                 id: productAttributeSchema.id,
    //                 name: productAttributeSchema.name,
    //                 slug: productAttributeSchema.slug,
    //                 status: productAttributeSchema.status,
    //                 image_uri: productAttributeSchema.image_uri,
    //                 description: productAttributeSchema.description
    //             })
    //             .from(productAttributeSchema)
    //             .where(and(eq(productAttributeSchema.id, id), eq(productAttributeSchema.deleted_flg, false)))
    //             .limit(1);

    //         if (productAttributeResult.length === 0) {
    //             return null;
    //         }

    //         const productAttribute = productAttributeResult[0];

    //         const categoryIdsResult = await db
    //             .select({
    //                 product_category_id: productCategoryBrandSchema.product_category_id
    //             })
    //             .from(productCategoryBrandSchema)
    //             .where(eq(productCategoryBrandSchema.product_brand_id, productAttribute.id));

    //         const product_category_id = categoryIdsResult.map(row => row.product_category_id);

    //         return {
    //             ...productAttribute,
    //             product_category_id
    //         };

    //     } catch (error) {
    //         handleDatabaseError(error)
    //     }
    // }

    // async delete(id: string, query: IDeleteDTO) {
    //     try {
    //         if (query.force) {
    //             return db.delete(productAttributeSchema).where(eq(productAttributeSchema.id, id))
    //         } else {
    //             return await db
    //                 .update(productAttributeSchema)
    //                 .set({
    //                     deleted_flg: false,
    //                     slug: slugTimestamp(query.slug!)
    //                 })
    //                 .where(eq(productAttributeSchema.id, id))
    //                 .returning({
    //                     id: productAttributeSchema.id
    //                 })
    //         }
    //     } catch (error) {
    //         handleDatabaseError(error)
    //     }
    // }
}
