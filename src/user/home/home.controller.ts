// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import { homeData } from './home.service'

export const homeController = new Elysia({ prefix: '/home' })
    .use(homeData)
