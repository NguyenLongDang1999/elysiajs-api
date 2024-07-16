// ** Elysia Imports
import { t, Static } from 'elysia'

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

// ** Types
export type IAuthSignInDTO = Static<typeof signInType>
