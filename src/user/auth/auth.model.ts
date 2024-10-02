// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import {
    changePasswordType,
    resetPasswordTokenType,
    resetPasswordType,
    signInType,
    signUpType
} from './auth.type'

export const AuthModels = new Elysia().model({
    signIn: signInType,
    signUp: signUpType,
    changePassword: changePasswordType,
    resetPassword: resetPasswordType,
    resetPasswordToken: resetPasswordTokenType
})
