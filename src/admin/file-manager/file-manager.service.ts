// ** Database Imports
import { db } from '@src/database/drizzle'
import { systemSettingOptionsSchema, systemSettingsSchema } from '@src/database/drizzle/schema'

// ** Types Imports
import { IFileManagerDTO, IFileManagerSearchDTO } from './file-manager.type'

// ** Drizzle Imports
import { and, count, desc, eq, ilike, isNull } from 'drizzle-orm'

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

    async create(createFileManagerDto: IFileManagerDTO, path: string) {
        const storageName = await this.systemSettingBunnyCDN('storage_name')

        const pathName = this.buildPath(path, createFileManagerDto.folder_name + '/')
        const url = `${await this.getBaseUrl()}${storageName?.value}/${pathName}`

        return this.sendRequest('put', url)
    }

    async delete(createFileManagerDto: IFileManagerDTO, path: string) {
        const storageName = await this.systemSettingBunnyCDN('storage_name')

        const pathName = this.buildPath(
            path,
            createFileManagerDto.folder_name + (createFileManagerDto.is_folder ? '/' : ''),
        )
        const url = `${await this.getBaseUrl()}${storageName?.value}/${pathName}`

        return this.sendRequest('delete', url)
    }

    // async uploadFile(path: string, file: Express.Multer.File) {
    //     const storageName = await this.systemSettingBunnyCDN('storage_name')

    //     const pathName = this.buildPath(path, file.originalname)
    //     const url = `${await this.getBaseUrl()}${storageName.value}/${pathName}`

    //     return this.sendRequest('put', url, file.buffer)
    // }

    private async sendRequest(method: string, url: string, data?: any) {
        try {
            const accessKey = await this.systemSettingBunnyCDN('access_key');
            const response = await fetch(url, {
                method,
                body: data,
                headers: {
                    'Accept': '*/*',
                    Accesskey: accessKey?.value as string
                }
            })

            return await response.json();
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
            const systemSetting = await db
                .select({
                    id: systemSettingsSchema.id,
                    key: systemSettingsSchema.key,
                    label: systemSettingsSchema.label,
                    value: systemSettingsSchema.value,
                    input_type: systemSettingsSchema.input_type
                })
                .from(systemSettingsSchema)
                .where(
                    and(
                        eq(systemSettingsSchema.deleted_flg, false),
                        ilike(systemSettingsSchema.key, `secret_key_bunnycdn_${key}`)
                    )
                )
                .leftJoin(systemSettingOptionsSchema, eq(systemSettingOptionsSchema.system_setting_id, systemSettingsSchema.id))

            return systemSetting.find((_s) => _s.key.endsWith(key))
        } catch (error) {
            handleDatabaseError(error)
        }
    }
}
