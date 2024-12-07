// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Types Imports
import {
    changePasswordType,
    forgotPasswordType,
    resetPasswordTokenType,
    resetPasswordType,
    signInType,
    signUpType
} from './auth.type'

export const AuthModels = new Elysia().model({
    signIn: signInType,
    signUp: signUpType,
    changePassword: changePasswordType,
    forgotPassword: forgotPasswordType,
    resetPassword: resetPasswordType,
    resetPasswordToken: resetPasswordTokenType
})
