// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { signInType, signUpType } from './auth.type'

export const AuthModels = new Elysia().model({
    signIn: signInType,
    signUp: signUpType
})
