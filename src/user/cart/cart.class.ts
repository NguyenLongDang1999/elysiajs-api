export class UserCartClass {
    async getOrCreateCart(prisma: any, user_id?: string, session_id?: string) {
        const cart = session_id
            ? await prisma.carts.findFirst({
                where: { session_id },
                select: {
                    id: true,
                    session_id: true
                }
            })
            : null

        if (cart) return cart

        return prisma.carts.create({
            data: {
                user_id: session_id ? null : user_id,
                session_id: session_id || undefined
            },
            select: {
                id: true,
                session_id: true
            }
        })
    }
}
