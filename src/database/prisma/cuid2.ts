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
                    if (!('id' in draft.data)) {
                        ;(draft.data as { id?: string }).id = createId()
                    }
                })

                return query(argsWithNewId)
            },
            createMany({ query, args }) {
                const argsWithNewIds = produce(args, (draft: Draft<typeof args>) => {
                    if (Array.isArray(draft.data)) {
                        draft.data = draft.data.map((item) => {
                            if (!('id' in item)) {
                                ;(item as { id?: string }).id = createId()
                            }

                            return item
                        }) as typeof draft.data
                    } else {
                        if (!('id' in draft.data)) {
                            ;(draft.data as { id?: string }).id = createId()
                        }
                    }
                })

                return query(argsWithNewIds)
            }
        }
    }
})

export default cuid2Extension
