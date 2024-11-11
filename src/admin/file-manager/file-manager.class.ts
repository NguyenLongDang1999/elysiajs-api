// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

export class FileManagerClass {
    async sendRequest(method: string, url: string, data?: any) {
        try {
            const accessKey = Bun.env.BUNNY_ACCESS_KEY

            const response = await fetch(url, {
                method,
                body: data,
                headers: {
                    Accept: '*/*',
                    Accesskey: accessKey as string
                }
            })

            return await response.json()
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    buildPath(...segments: (string | undefined)[]) {
        return segments
            .filter((segment): segment is string => !!segment)
            .join('/')
            .replace(/,/g, '/')
    }

    async getBaseUrl() {
        // const storageZone = Bun.env.BUNNY_STORAGE_ZONE

        // return storageZone ? `https://${storageZone}.storage.bunnycdn.com/` : 'https://storage.bunnycdn.com/'

        return `${Bun.env.BUNNY_BASE_URL}/`
    }
}
