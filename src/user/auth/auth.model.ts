// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import { changePasswordType, signInType, signUpType } from './auth.type'

export const AuthModels = new Elysia().model({
    signIn: signInType,
    signUp: signUpType,
    changePassword: changePasswordType
})
