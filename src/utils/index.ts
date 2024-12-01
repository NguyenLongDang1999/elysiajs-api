// ** Types Imports
import { Prisma } from '@prisma/client'
import {
    IProductCategoryNestedListDTO,
    ISortDTO
} from '@src/user/product-category/product-category.type'

export const slugTimestamp = (slug: string) => {
    const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '')

    return `${slug}-${dateSuffix}`
}

export const createRedisKey = (prefix: string, identifier?: string) => {
    return `${prefix}:${identifier}`
}

export const getProductOrderBy = (orderBy?: ISortDTO) => {
    const sortConditions = {
        'created_at-desc': {
            created_at: Prisma.SortOrder.desc
        },
        'created_at-asc': {
            created_at: Prisma.SortOrder.asc
        },
        'name-asc': {
            name: Prisma.SortOrder.desc
        },
        'name-desc': {
            name: Prisma.SortOrder.asc
        },
        'price-asc': {
            price: Prisma.SortOrder.asc
        },
        'price-desc': {
            price: Prisma.SortOrder.desc
        }
    }

    return sortConditions[orderBy ?? 'created_at-desc']
}

export const getNormalizedList = (value: string | string[]) => {
    if (typeof value === 'string') {
        return value.split(',').map((_v) => _v)
    }

    return Array.isArray(value) ? [...value] : value ? [value] : undefined
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

export const generateOrderId = () => {
    const prefix = 'ORD'
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '')
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()

    return `${prefix}-${datePart}-${randomPart}`
}
