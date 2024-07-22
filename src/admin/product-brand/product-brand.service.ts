// ** Database Imports
import { productBrandSchema, productCategoryBrandSchema } from '@db/schema/product-brands'
import { db } from '@src/database/drizzle'

// ** Types Imports
import { IProductBrandDTO, IProductBrandSearchDTO } from './product-brand.type'

// ** Drizzle Imports
import { and, count, eq, ilike, inArray, SQL } from 'drizzle-orm'

// ** Utils Imports
import { slugTimestamp } from '@src/utils'
import { handleDatabaseError } from '@utils/error-handling'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'

export class ProductBrandService {
    async getTableList(query: IProductBrandSearchDTO) {
        try {
            const where: SQL[] = [eq(productBrandSchema.deleted_flg, false)]

            if (query.name) {
                where.push(ilike(productBrandSchema.name, `%${query.name}%`))
            }

            if (query.product_category_id) {
                where.push(
                    inArray(
                        productBrandSchema.id,
                        db
                            .select({ product_brand_id: productCategoryBrandSchema.product_brand_id })
                            .from(productCategoryBrandSchema)
                            .where(eq(productCategoryBrandSchema.product_category_id, query.product_category_id))
                    )
                )
            }

            if (query.status) {
                where.push(eq(productBrandSchema.status, Number(query.status)))
            }

            const [data, [aggregations]] = await Promise.all([
                db.query.productBrandSchema.findMany({
                    offset: query.page,
                    limit: query.pageSize,
                    orderBy: (productBrand, { desc }) => [desc(productBrand.created_at)],
                    where: and(...where),
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        image_uri: true,
                        created_at: true
                    },
                    with: {
                        product: {
                            where: (product, { eq }) => eq(product.deleted_flg, false),
                            columns: {
                                id: true
                            }
                        },
                        productCategoryBrand: {
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
                        value: count(productBrandSchema.id)
                    })
                    .from(productBrandSchema)
                    .where(and(...where))
            ])

            return {
                data: data.map((_data) => ({
                    ..._data,
                    productCategoryBrand: _data.productCategoryBrand.map((_product) => _product.productCategory)
                })),
                aggregations: aggregations.value
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(data: IProductBrandDTO) {
        try {
            return await db.transaction(async (tx) => {
                const [productBrand] = await tx
                    .insert(productBrandSchema)
                    .values(data)
                    .returning({ id: productBrandSchema.id })

                const productCategoryBrands = data.product_category_id.map((product_category_id) => ({
                    product_brand_id: productBrand.id,
                    product_category_id
                }))

                await tx.insert(productCategoryBrandSchema).values(productCategoryBrands)

                return productBrand
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: IProductBrandDTO) {
        try {
            return await db.transaction(async (tx) => {
                const [productBrand] = await tx
                    .update(productBrandSchema)
                    .set(data)
                    .where(eq(productBrandSchema.id, id))
                    .returning({ id: productBrandSchema.id })

                await tx.delete(productCategoryBrandSchema).where(eq(productCategoryBrandSchema.product_brand_id, id))

                const productCategoryBrands = data.product_category_id.map((product_category_id) => ({
                    product_brand_id: productBrand.id,
                    product_category_id
                }))

                await tx.insert(productCategoryBrandSchema).values(productCategoryBrands)

                return productBrand
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string) {
        try {
            const productBrand = await db.query.productBrandSchema.findFirst({
                where: and(eq(productBrandSchema.id, id), eq(productBrandSchema.deleted_flg, false)),
                columns: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    image_uri: true,
                    description: true
                },
                with: {
                    productCategoryBrand: {
                        columns: {
                            product_category_id: true
                        }
                    }
                }
            })

            return {
                ...productBrand,
                product_category_id: productBrand?.productCategoryBrand.map(
                    ({ product_category_id }) => product_category_id
                )
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO) {
        try {
            if (query.force) {
                return db.delete(productBrandSchema).where(eq(productBrandSchema.id, id))
            } else {
                return await db
                    .update(productBrandSchema)
                    .set({
                        deleted_flg: true,
                        slug: slugTimestamp(query.slug!)
                    })
                    .where(eq(productBrandSchema.id, id))
                    .returning({
                        id: productBrandSchema.id
                    })
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
