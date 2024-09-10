// ** Prisma Imports
import prismaClient from '@src/database/prisma'

// ** Utils Imports
import { HASH_PASSWORD } from '@utils/enums'

async function main() {
    console.log('Start seeding ...')
    // ------------------------------- BEGIN ADMINISTRATOR -------------------------------
    await prismaClient.admins.deleteMany({
        where: { email: 'longdang0412@gmail.com' }
    })

    const hashPassword = await Bun.password.hash('dang04121999', {
        algorithm: HASH_PASSWORD.ALGORITHM
    })

    await prismaClient.admins.create({
        data: {
            name: 'Administrator',
            email: 'longdang0412@gmail.com',
            phone: '0389747179',
            role: 10,
            password: hashPassword
        }
    })
    // ------------------------------- END ADMINISTRATOR -------------------------------

    console.log('Finish seeding ...')
}

main()
    .then(async () => {
        await prismaClient.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prismaClient.$disconnect()
        process.exit(1)
    })
