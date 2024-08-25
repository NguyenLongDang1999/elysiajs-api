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

export const getProductOrderBy = (orderBy: '1' | '2' | '3' | '4' | '5' | '6') => {
    const sortConditions = {
        '1': {
            created_at: 'desc'
        },
        '2': {
            created_at: 'asc'
        },
        '3': {
            name: 'asc'
        },
        '4': {
            name: 'desc'
        },
        '5': {
            price: 'asc'
        },
        '6': {
            price: 'desc'
        }
    }

    return sortConditions[orderBy]
}

export const getNormalizedList = (value: string | string[]) => {
    return Array.isArray(value) ? value.map((_v) => _v) : value ? [value] : undefined
}
