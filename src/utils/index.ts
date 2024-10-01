// ** Types Imports
import { Prisma } from '@prisma/client'
import { IProductCategoryNestedListDTO, ISortDTO } from '@src/user/product-category/product-category.type'

export const slugTimestamp = (slug: string) => {
    const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '')

    return `${slug}-${dateSuffix}`
}

export const getExpTimestamp = (seconds: number) => {
    const currentTimeMilliseconds = Date.now()
    const secondsIntoMilliseconds = seconds * 1000
    const expirationTimeMilliseconds = currentTimeMilliseconds + secondsIntoMilliseconds

    return Math.floor(expirationTimeMilliseconds / 1000)
}

export const createRedisKey = (prefix: string, identifier?: string) => {
    return `${prefix}:${identifier}`
}

export const getProductOrderBy = (orderBy?: ISortDTO) => {
    const sortConditions = {
        '1': {
            created_at: Prisma.SortOrder.desc
        },
        '2': {
            created_at: Prisma.SortOrder.asc
        },
        '3': {
            name: Prisma.SortOrder.asc
        },
        '4': {
            name: Prisma.SortOrder.desc
        },
        '5': {
            price: Prisma.SortOrder.asc
        },
        '6': {
            price: Prisma.SortOrder.desc
        }
    }

    return sortConditions[orderBy ?? '1']
}

export const getNormalizedList = (value: string | string[]) => {
    return Array.isArray(value) ? value.map((_v) => _v) : value ? [value] : undefined
}

export const getBreadcrumbs = (
    categoryMap: { [key: string]: IProductCategoryNestedListDTO | null },
    currentCategoryId: string
): Pick<IProductCategoryNestedListDTO, 'id' | 'name' | 'slug'>[] => {
    const breadcrumbs: Pick<IProductCategoryNestedListDTO, 'id' | 'name' | 'slug'>[] = []

    let currentCategory = categoryMap[currentCategoryId]
    while (currentCategory) {
        breadcrumbs.push({
            id: currentCategory.id,
            slug: currentCategory.slug,
            name: currentCategory.name
        })

        currentCategory = currentCategory.parent_id ? categoryMap[currentCategory.parent_id] : null
    }

    return breadcrumbs.reverse()
}

export const flattenCategories = (
    categories: IProductCategoryNestedListDTO[],
    categoryMap: { [key: string]: IProductCategoryNestedListDTO | null }
): void => {
    for (const category of categories) {
        categoryMap[category.id] = category

        if (category.children && category.children.length > 0) {
            flattenCategories(category.children, categoryMap)
        }
    }
}
