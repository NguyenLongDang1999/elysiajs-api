import prismaClient from './'

async function main() {
    console.log('Start seeding ...')

    await prismaClient.admins.deleteMany({
        where: { email: 'longdang0412@gmail.com' }
    })

    const hashPassword = await Bun.password.hash('dang04121999', {
        algorithm: 'argon2id'
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
