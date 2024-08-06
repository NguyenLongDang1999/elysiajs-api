// ** Elysia Imports
import { error } from 'elysia'

// ** Prisma Imports
import { Prisma } from '@prisma/client'

export function handleDatabaseError(errors: unknown) {
    if (errors instanceof Prisma.PrismaClientKnownRequestError) {
        if (errors.code === 'P2002') {
            throw error('Conflict')
        }

        throw error('Bad Request')
    }

    if (
        errors instanceof Prisma.PrismaClientInitializationError ||
        errors instanceof Prisma.PrismaClientRustPanicError
    ) {
        throw error('Service Unavailable')
    }

    throw error('Internal Server Error')
}
