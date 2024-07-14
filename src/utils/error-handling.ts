export function handleDatabaseError(error: any) {
    console.log(error)
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //     if (error.code === 'P2002') {
    //         throw new ConflictException('A record with the provided details already exists.')
    //     }

    //     throw new BadRequestException(`Database request failed: ${error.message}`)
    // }

    // if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientRustPanicError) {
    //     throw new ServiceUnavailableException(`Database connection error: ${error.message}`)
    // }

    // throw new InternalServerErrorException(`An unexpected error occurred: ${error.message}`)
}
