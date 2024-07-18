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
import { and, count, eq, ilike, inArray, SQL } from 'drizzle-orm'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Types Imports

export class ProductAttributeService {
    async getTableList(query: IProductAttributeSearchDTO) {
        try {
            const where: SQL[] = [eq(productAttributeSchema.deleted_flg, false)]

            if (query.name) {
                where.push(ilike(productAttributeSchema.name, `%${query.name}%`))
            }

            if (query.product_category_id) {
                where.push(
                    inArray(
                        productAttributeSchema.id,
                        db
                            .select({ product_attribute_id: productCategoryAttributeSchema.product_attribute_id })
                            .from(productCategoryAttributeSchema)
                            .where(eq(productCategoryAttributeSchema.product_category_id, query.product_category_id))
                    )
                )
            }

            if (query.status) {
                where.push(eq(productAttributeSchema.status, Number(query.status)))
            }

            const [data, [aggregations]] = await Promise.all([
                db.query.productAttributeSchema.findMany({
                    offset: query.page,
                    limit: query.pageSize,
                    orderBy: (productAttribute, { desc }) => [desc(productAttribute.created_at)],
                    where: and(...where),
                    columns: {
                        id: true,
                        name: true,
                        status: true,
                        created_at: true
                    },
                    with: {
                        productAttributeValues: {
                            columns: {
                                id: true
                            }
                        },
                        productCategoryAttributes: {
                            with: {
                                productCategory: {
                                    columns: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }),
                db
                    .select({
                        value: count(productAttributeSchema.id)
                    })
                    .from(productAttributeSchema)
                    .where(and(...where))
            ])

            return {
                data: data.map((_data) => ({
                    ..._data,
                    productCategoryAttributes: _data.productCategoryAttributes.map(
                        (_product) => _product.productCategory
                    )
                })),
                aggregations: aggregations.value
            }
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
