// ** Prisma Imports
import prismaClient from '@src/database/prisma'

export class ProductCategoryClass {
    async renderTree(parent_id: string, level: number) {
        const categories = await prismaClient.productCategory.findMany({
            where: {
                parent_id,
                deleted_flg: false
            },
            select: {
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
