// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    authProfile,
    authRefresh,
    authSignIn,
    authSignOut
} from './auth.service'

export const authController = new Elysia({ prefix: '/auth' })
    .use(authSignIn)
    .use(authProfile)
    .use(authRefresh)
    .use(authSignOut)
