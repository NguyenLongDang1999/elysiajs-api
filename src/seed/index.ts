// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Class Imports
import { SeedAuthClass } from './auth/auth.class'

export const seed = new Elysia({ prefix: '/seed' })
    .decorate({
        SeedAuthClass: new SeedAuthClass()
    })
    .get('/', async ({ SeedAuthClass }) => {
        await SeedAuthClass.authSeedCreate()

        return { message: 'Seed data created successfully' }
    })
