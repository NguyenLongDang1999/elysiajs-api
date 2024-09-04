// ** Elysia Imports
import { Static, t } from 'elysia'

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
    email: t.String({
        minLength: 1,
        format: 'email'
    })
})

// ** Types
export type IAuthSignInDTO = Static<typeof signInType>

export type IAuthSignUpDTO = Static<typeof signUpType>

export type IAuthChangePasswordDTO = Static<typeof changePasswordType>
