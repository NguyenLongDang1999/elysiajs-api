import { PrismaClient } from '@prisma/client'

import cuid2Extension from './cuid2'

const prismaClient = new PrismaClient().$extends(cuid2Extension)

export default prismaClient
