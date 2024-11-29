import { createId } from '@paralleldrive/cuid2'
import { Prisma } from '@prisma/client'
import {
    Draft,
    produce
} from 'immer'

const cuid2Extension = Prisma.defineExtension({
    name: 'cuid2',
    query: {
        $allModels: {
            create({ query, args }) {
                const argsWithNewId = produce(args, (draft: Draft<typeof args>) => {
                    if (draft.data && typeof draft.data === 'object' && 'id' in draft.data) {
                        if (!draft.data.id) {
                            draft.data.id = createId()
                        }
                    }
                })

                return query(argsWithNewId)
            },
            createMany({ query, args }) {
                const argsWithNewIds = produce(args, (draft: Draft<typeof args>) => {
                    if (Array.isArray(draft.data)) {
                        draft.data = draft.data.map((item) => {
                            if (typeof item === 'object' && 'id' in item && !item.id) {
                                item.id = createId()
                            }
                            return item
                        }) as typeof draft.data
                    }
                })

                return query(argsWithNewIds)
            }
        }
    }
})

export default cuid2Extension
