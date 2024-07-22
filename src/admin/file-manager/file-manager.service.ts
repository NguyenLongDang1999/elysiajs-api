// ** Database Imports
import prismaClient from '@src/database/prisma'

// ** Types Imports
import { IFileManagerDTO, IFileManagerSearchDTO, IFileManagerUploadDTO } from './file-manager.type'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

export class FileManagerService {
    async getTableList(query: IFileManagerSearchDTO) {
        try {
            const storageName = await this.systemSettingBunnyCDN('storage_name')

            const pathName = this.buildPath(query.path)
            const url = `${await this.getBaseUrl()}${storageName?.value}/${pathName}/`

            return this.sendRequest('get', url)
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    async create(createFileManagerDto: IFileManagerDTO, query: IFileManagerSearchDTO) {
        const storageName = await this.systemSettingBunnyCDN('storage_name')

        const pathName = this.buildPath(query.path, createFileManagerDto.folder_name + '/')
        const url = `${await this.getBaseUrl()}${storageName?.value}/${pathName}`

        return this.sendRequest('put', url)
    }

    async delete(createFileManagerDto: IFileManagerDTO, query: IFileManagerSearchDTO) {
        const storageName = await this.systemSettingBunnyCDN('storage_name')

        const pathName = this.buildPath(
            query.path,
            createFileManagerDto.folder_name + (createFileManagerDto.is_folder ? '/' : '')
        )
        const url = `${await this.getBaseUrl()}${storageName?.value}/${pathName}`

        return this.sendRequest('delete', url)
    }

    async uploadFile(query: IFileManagerSearchDTO, body: IFileManagerUploadDTO) {
        const storageName = await this.systemSettingBunnyCDN('storage_name')
        const pathName = this.buildPath(query.path, body.file.name)
        const url = `${await this.getBaseUrl()}${storageName?.value}/${pathName}`
        const buffer = await body.file.arrayBuffer()

        return this.sendRequest('put', url, buffer)
    }

    private async sendRequest(method: string, url: string, data?: any) {
        try {
            const accessKey = await this.systemSettingBunnyCDN('access_key')
            const response = await fetch(url, {
                method,
                body: data,
                headers: {
                    Accept: '*/*',
                    Accesskey: accessKey?.value as string
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
        const storageZone = await this.systemSettingBunnyCDN('storage_zone')

        return storageZone?.value
            ? `https://${storageZone.value}.storage.bunnycdn.com/`
            : 'https://storage.bunnycdn.com/'
    }

    private async systemSettingBunnyCDN(key: string) {
        try {
            const systemSetting = await prismaClient.systemSettings.findMany({
                orderBy: { created_at: 'desc' },
                where: {
                    deleted_flg: false,
                    key: {
                        startsWith: 'secret_key_bunnycdn_'
                    }
                },
                include: {
                    systemSettingOptions: true
                }
            })

            return systemSetting.find((_s) => _s.key.endsWith(key))
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
