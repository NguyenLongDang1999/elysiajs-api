// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { signInType } from './auth.type'

export const AuthModels = new Elysia().model({
    signIn: signInType
})
