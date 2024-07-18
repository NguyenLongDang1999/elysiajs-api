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
