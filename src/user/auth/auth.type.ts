// ** Elysia Imports
import { JWTPayloadSpec } from '@elysiajs/jwt'
import {
    Static,
    t
} from 'elysia'

// ** Types Definition
export const signInType = t.Object({
    email: t.String({
        minLength: 1,
        format: 'email'
    }),
    password: t.String({
        minLength: 6,
        maxLength: 20
    })
})

export const signUpType = t.Object({
    name: t.String({ minLength: 1 }),
    phone: t.String({ minLength: 1 }),
    email: t.String({
        minLength: 1,
        format: 'email'
    }),
    password: t.String({
        minLength: 6,
        maxLength: 20
    })
})

export const changePasswordType = t.Object({
    old_password: t.String({
        minLength: 6,
        maxLength: 20
    }),
    password: t.String({
        minLength: 6,
        maxLength: 20
    }),
    confirm_password: t.String({
        minLength: 6,
        maxLength: 20
    })
})

export const forgotPasswordType = t.Object({
    email: t.String({
        minLength: 1,
        format: 'email'
    })
})

export const resetPasswordType = t.Object({
    password: t.String({
        minLength: 6,
        maxLength: 20
    })
})

export const resetPasswordTokenType = t.Object({
    token: t.String()
})

// ** Types
export type IAuthSignInDTO = Static<typeof signInType>

export type IAuthSignUpDTO = Static<typeof signUpType>

export type IAuthChangePasswordDTO = Static<typeof changePasswordType>

export type IAuthForgotPasswordDTO = Static<typeof forgotPasswordType>

export type IAuthResetPasswordDTO = Static<typeof resetPasswordType>

export type IAuthResetPasswordTokenDTO = Static<typeof resetPasswordTokenType>

export type IAuthJwt = {
    readonly sign: (
        morePayload: {
            sub: string
        } & JWTPayloadSpec
    ) => Promise<string>
    readonly verify: (jwt?: string) => Promise<
        | false
        | ({
            sub: string
        } & JWTPayloadSpec)
    >
}
