// ** Database Imports
import { db } from '@src/database/drizzle'
import { productCategorySchema } from '@db/schema/product-category'

// ** Types Imports
import { IProductCategorySearchDTO, IProductCategoryDTO } from './product-category.type'

// ** Drizzle Imports
import { alias } from 'drizzle-orm/pg-core'
import { and, count, desc, eq, ilike, isNull } from 'drizzle-orm'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'
import { slugTimestamp } from '@src/utils'

// ** Types Imports
import { IDeleteDTO } from '@src/types/core.type'

export class ProductCategoryService {
    async getTableList(query: IProductCategorySearchDTO) {
        try {
            const where = [eq(productCategorySchema.deleted_flg, false)]

            if (query.name) {
                where.push(ilike(productCategorySchema.name, `%${query.name}%`))
            }

            if (query.parent_id) {
                where.push(eq(productCategorySchema.parent_id, query.parent_id))
            }

            if (query.status) {
                where.push(eq(productCategorySchema.status, Number(query.status)))
            }

            const parentCategory = alias(productCategorySchema, 'parentCategory')

            const data = await db
                .select({
                    id: productCategorySchema.id,
                    name: productCategorySchema.name,
                    status: productCategorySchema.status,
                    image_uri: productCategorySchema.image_uri,
                    created_at: productCategorySchema.created_at,
                    parentCategory: {
                        id: parentCategory.id,
                        name: parentCategory.name,
                        image_uri: parentCategory.image_uri
                    }
                })
                .from(productCategorySchema)
                .leftJoin(parentCategory, eq(parentCategory.id, productCategorySchema.parent_id))
                .where(and(...where))
                .orderBy(desc(productCategorySchema.created_at))
                .limit(Number(query.pageSize))
                .offset(Number(query.page))

            const aggregations = await db
                .select({
                    value: count(productCategorySchema.id)
                })
                .from(productCategorySchema)
                .where(and(...where))

            return {
                data: data.map((_d) => ({
                    ..._d,
                    product: []
                })),
                aggregations: aggregations[0].value
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(data: IProductCategoryDTO) {
        try {
            return await db.insert(productCategorySchema).values(data).returning({
                id: productCategorySchema.id
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async update(id: string, data: IProductCategoryDTO) {
        try {
            return await db.update(productCategorySchema).set(data).where(eq(productCategorySchema.id, id)).returning({
                id: productCategorySchema.id
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async retrieve(id: string) {
        try {
            return await db.query.productCategorySchema.findFirst({
                where: and(eq(productCategorySchema.id, id), eq(productCategorySchema.deleted_flg, false)),
                columns: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    parent_id: true,
                    image_uri: true,
                    description: true,
                    meta_title: true,
                    meta_description: true
                }
            })
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async delete(id: string, query: IDeleteDTO) {
        try {
            if (query.force) {
                return db.delete(productCategorySchema).where(eq(productCategorySchema.id, id))
            } else {
                return await db
                    .update(productCategorySchema)
                    .set({
                        deleted_flg: false,
                        slug: slugTimestamp(query.slug!)
                    })
                    .where(eq(productCategorySchema.id, id))
                    .returning({
                        id: productCategorySchema.id
                    })
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async getDataList() {
        try {
            const categoryList = await db.query.productCategorySchema.findMany({
                orderBy: desc(productCategorySchema.created_at),
                where: (_productCategory, { and }) =>
                    and(eq(productCategorySchema.deleted_flg, false), isNull(productCategorySchema.parent_id)),
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
        const categories = await db.query.productCategorySchema.findMany({
            where: (_productCategory, { and }) =>
                and(eq(productCategorySchema.deleted_flg, false), eq(productCategorySchema.parent_id, parent_id)),
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
