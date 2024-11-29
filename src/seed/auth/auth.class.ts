// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { HASH_PASSWORD } from '@utils/enums'

export class SeedAuthClass {
    async authSeedCreate() {
        const hashedPassword = await this.hashData('dang04121999')

        await prismaClient.admins.deleteMany()
        await prismaClient.admins.create({
            data: {
                name: 'Nguyễn Long Đăng',
                email: 'longdang0412@gmail.com',
                password: hashedPassword,
                phone: '0389747179',
                role: 10
            }
        })
    }

    hashData(data: string) {
        return Bun.password.hash(data, {
            algorithm: HASH_PASSWORD.ALGORITHM
        })
    }
}
