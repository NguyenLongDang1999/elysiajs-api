// ** Types Imports
import { IFileManagerDTO, IFileManagerSearchDTO, IFileManagerUploadDTO } from './file-manager.type'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

export class FileManagerService {
    async getTableList(query: IFileManagerSearchDTO) {
        try {
            const storageName = Bun.env.BUNNY_STORAGE_NAME

            const pathName = this.buildPath(query.path)
            const url = `${await this.getBaseUrl()}${storageName}/${pathName}/`

            return this.sendRequest('get', url)
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(createFileManagerDto: IFileManagerDTO, query: IFileManagerSearchDTO) {
        const storageName = Bun.env.BUNNY_STORAGE_NAME

        const pathName = this.buildPath(query.path, createFileManagerDto.folder_name + '/')
        const url = `${await this.getBaseUrl()}${storageName}/${pathName}`

        return this.sendRequest('put', url)
    }

    async delete(createFileManagerDto: IFileManagerDTO, query: IFileManagerSearchDTO) {
        const storageName = Bun.env.BUNNY_STORAGE_NAME

        const pathName = this.buildPath(
            query.path,
            createFileManagerDto.folder_name + (createFileManagerDto.is_folder ? '/' : '')
        )
        const url = `${await this.getBaseUrl()}${storageName}/${pathName}`

        return this.sendRequest('delete', url)
    }

    async uploadFile(query: IFileManagerSearchDTO, body: IFileManagerUploadDTO) {
        const storageName = Bun.env.BUNNY_STORAGE_NAME

        const pathName = this.buildPath(query.path, body.file.name)
        const url = `${await this.getBaseUrl()}${storageName}/${pathName}`
        const buffer = await body.file.arrayBuffer()

        return this.sendRequest('put', url, buffer)
    }

    private async sendRequest(method: string, url: string, data?: any) {
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

    private buildPath(...segments: string[]) {
        return segments.join('/').replace(/,/g, '/')
    }

    private async getBaseUrl() {
        const storageZone = Bun.env.BUNNY_STORAGE_ZONE

        return storageZone ? `https://${storageZone}.storage.bunnycdn.com/` : 'https://storage.bunnycdn.com/'
    }
}
