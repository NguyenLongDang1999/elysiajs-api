// ** Elysia Imports
import {
    Static,
    t
} from 'elysia'
import { JWTPayloadSpec } from '@elysiajs/jwt'

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
