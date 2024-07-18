// ** Database Imports
import { productBrandSchema, productCategoryBrandSchema } from '@db/schema/product-brands'
import { db } from '@src/database/drizzle'

// ** Types Imports
import { IProductBrandDTO, IProductBrandSearchDTO } from './product-brand.type'

// ** Drizzle Imports
import { and, count, desc, eq, exists, ilike, isNull, SQL } from 'drizzle-orm'

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
                    exists(
                        db
                            .select()
                            .from(productCategoryBrandSchema)
                            .where(
                                and(
                                    eq(productCategoryBrandSchema.product_category_id, query.product_category_id),
                                    eq(productCategoryBrandSchema.product_brand_id, productBrandSchema.id)
                                )
                            )
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
            return await db.update(productBrandSchema).set(data).where(eq(productBrandSchema.id, id)).returning({
                id: productBrandSchema.id
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string) {
        try {
            const productBrandResult = await db
                .select({
                    id: productBrandSchema.id,
                    name: productBrandSchema.name,
                    slug: productBrandSchema.slug,
                    status: productBrandSchema.status,
                    image_uri: productBrandSchema.image_uri,
                    description: productBrandSchema.description
                })
                .from(productBrandSchema)
                .where(and(eq(productBrandSchema.id, id), eq(productBrandSchema.deleted_flg, false)))
                .limit(1)

            if (productBrandResult.length === 0) {
                return null
            }

            const productBrand = productBrandResult[0]

            const categoryIdsResult = await db
                .select({
                    product_category_id: productCategoryBrandSchema.product_category_id
                })
                .from(productCategoryBrandSchema)
                .where(eq(productCategoryBrandSchema.product_brand_id, productBrand.id))

            const product_category_id = categoryIdsResult.map((row) => row.product_category_id)

            return {
                ...productBrand,
                product_category_id
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
                        deleted_flg: false,
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

    async getDataList() {
        try {
            const categoryList = await db.query.productBrandSchema.findMany({
                orderBy: desc(productBrandSchema.created_at),
                where: (_productBrand, { and }) =>
                    and(eq(productBrandSchema.deleted_flg, false), isNull(productBrandSchema.id)),
                columns: {
                    id: true,
                    name: true
                }
            })

            const categoryNested = []

            for (const category of categoryList) {
                const categories = await this.renderTree(category.id, 1)
                categoryNested.push(category, ...categories)
            }

            return categoryNested
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async renderTree(parent_id: string, level: number) {
        const categories = await db.query.productBrandSchema.findMany({
            where: (_productBrand, { and }) =>
                and(eq(productBrandSchema.deleted_flg, false), eq(productBrandSchema.id, parent_id)),
            columns: {
                id: true,
                name: true
            }
        })

        const customLevelName = '|--- '.repeat(level)

        let categoryNested: {
            id: string
            name: string
        }[] = []

        for (const category of categories) {
            const name = customLevelName + category.name
            categoryNested.push({ ...category, name: name })

            const children = await this.renderTree(category.id, level + 1)
            categoryNested = [...categoryNested, ...children]
        }

        return categoryNested
    }
}
