// ** Types Imports
import { Prisma } from '@prisma/client'
import { ISortDTO } from '@src/user/product-category/product-category.type'

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
