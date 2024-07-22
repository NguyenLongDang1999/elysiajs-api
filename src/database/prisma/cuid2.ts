import { createId } from '@paralleldrive/cuid2'
import { Prisma } from '@prisma/client'
import { produce } from 'immer'

const cuid2Extension = Prisma.defineExtension({
    name: 'cuid2',
    query: {
        $allModels: {
            create({ query, args }) {
                const argsWithNewId = produce(args, (draft) => {
                    if (!draft.data.id) {
                        draft.data.id = createId()
                    }
                })

                return query(argsWithNewId)
            },
            createMany({ query, args }) {
                const argsWithNewIds = produce(args, (draft) => {
                    if (Array.isArray(draft.data)) {
                        draft.data = draft.data.map((item) => {
                            if (!item.id) {
                                item.id = createId()
                            }

                            return item
                        }) as typeof draft.data
                    } else {
                        if (draft.data.id) {
                            draft.data.id = createId()
                        }
                    }
                })

                return query(argsWithNewIds)
            }
        }
    }
})

export default cuid2Extension
