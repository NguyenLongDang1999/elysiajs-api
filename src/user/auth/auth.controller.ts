// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    authChangePassword,
    authForgotPassword,
    authProfile,
    authResetPassword,
    authSignIn,
    authSignout,
    authSignUp
} from './auth.service'

export const authController = new Elysia({ prefix: '/auth' })
    .use(authSignIn)
    .use(authSignUp)
    .use(authProfile)
    .use(authSignout)
    .use(authForgotPassword)
    .use(authResetPassword)
    .use(authChangePassword)
