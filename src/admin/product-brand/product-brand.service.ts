// ** Database Imports
import { productBrandSchema, productCategoryBrandSchema } from '@db/schema/product-brands'
import { db } from '@src/database/drizzle'

// ** Types Imports
import { IProductBrandDTO, IProductBrandSearchDTO } from './product-brand.type'

// ** Drizzle Imports
import { and, count, desc, eq, exists, ilike, isNull } from 'drizzle-orm'

// ** Utils Imports
import { slugTimestamp } from '@src/utils'
import { handleDatabaseError } from '@utils/error-handling'

// ** Types Imports
import { productCategorySchema } from '@src/database/drizzle/schema'
import { IDeleteDTO } from '@src/types/core.type'

export class ProductBrandService {
    async getTableList(query: IProductBrandSearchDTO) {
        try {
            const searchConditions = [
                eq(productBrandSchema.deleted_flg, false),
                query.name ? ilike(productBrandSchema.name, `%${query.name}%`) : undefined,
                query.status ? eq(productBrandSchema.status, Number(query.status)) : undefined,
                query.product_category_id
                    ? exists(
                        db
                            .select()
                            .from(productCategoryBrandSchema)
                            .where(
                                and(
                                    eq(productCategoryBrandSchema.product_brand_id, productBrandSchema.id),
                                    eq(productCategoryBrandSchema.product_category_id, query.product_category_id)
                                )
                            )
                    )
                    : undefined
            ].filter(Boolean)

            const search = and(...searchConditions)

            const [data, aggregations] = await Promise.all([
                db
                    .select({
                        id: productBrandSchema.id,
                        name: productBrandSchema.name,
                        slug: productBrandSchema.slug,
                        status: productBrandSchema.status,
                        image_uri: productBrandSchema.image_uri,
                        created_at: productBrandSchema.created_at
                    })
                    .from(productBrandSchema)
                    .where(search)
                    .orderBy(desc(productBrandSchema.created_at))
                    .limit(Number(query.pageSize))
                    .offset(Number(query.page))
                    .prepare('fetchBrands')
                    .execute(),
                db
                    .select({
                        value: count()
                    })
                    .from(productBrandSchema)
                    .where(search)
                    .prepare('countBrands')
                    .execute()
            ])

            const productCategoryBrands = await Promise.all(
                data.map(async (item) => {
                    const categories = await db
                        .select({
                            productCategory: {
                                id: productCategorySchema.id,
                                name: productCategorySchema.name
                            }
                        })
                        .from(productCategoryBrandSchema)
                        .leftJoin(
                            productCategorySchema,
                            eq(productCategoryBrandSchema.product_category_id, productCategorySchema.id)
                        )
                        .where(
                            and(
                                eq(productCategoryBrandSchema.product_brand_id, item.id),
                                eq(productCategorySchema.deleted_flg, false)
                            )
                        )
                    return {
                        ...item,
                        productCategoryBrand: categories.map((categoryItem) => categoryItem.productCategory)
                    }
                })
            )

            return { data: productCategoryBrands, aggregations: aggregations[0].value }
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
                    .returning({ id: productBrandSchema.id });

                const productCategoryBrands = data.product_category_id.map(product_category_id => ({
                    product_brand_id: productBrand.id,
                    product_category_id
                }));

                await tx
                    .insert(productCategoryBrandSchema)
                    .values(productCategoryBrands);

                return productBrand;
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
                .limit(1);

            if (productBrandResult.length === 0) {
                return null;
            }

            const productBrand = productBrandResult[0];

            const categoryIdsResult = await db
                .select({
                    product_category_id: productCategoryBrandSchema.product_category_id
                })
                .from(productCategoryBrandSchema)
                .where(eq(productCategoryBrandSchema.product_brand_id, productBrand.id));

            const product_category_id = categoryIdsResult.map(row => row.product_category_id);

            return {
                ...productBrand,
                product_category_id
            };

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
