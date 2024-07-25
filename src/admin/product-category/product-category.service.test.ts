import { treaty } from '@elysiajs/eden'
import { describe, expect, it } from 'bun:test'
import { productCategoryController } from './product-category.controller'

const api = treaty(productCategoryController)

describe('ProductCategoryService', () => {
    it('getTableList', async () => {
        const { data, error } = await api['product-categories'].index.get({
            query: {
                page: '1',
                pageSize: '10',
                status: '10'
            }
        })

        expect(error).toBeNull()
        expect(data).toBeDefined()
    })

    it('create', async () => {
        const { data, error } = await api['product-categories'].index.post({
            name: 'New Category',
            slug: 'new-category'
        })

        expect(error).toBeNull()
        expect(data).toBeDefined()
    })
})
