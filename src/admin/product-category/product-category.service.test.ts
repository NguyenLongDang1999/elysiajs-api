import { treaty } from '@elysiajs/eden'
import { afterEach, describe, expect, it } from 'bun:test'
import { productCategoryController } from './product-category.controller'

const app = treaty<typeof productCategoryController>('localhost:3333/api/admin')

const mockProductCategory = {
    name: `Electronics-${new Date().getTime()}`,
    slug: `electronics-${new Date().getTime()}`,
    image_uri: 'test-image-uri',
    description: 'Test description',
    status: 20,
    meta_title: 'Test Meta Title',
    meta_description: 'Test Meta Description',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_flg: false
}

describe('ProductCategoryService', () => {
    afterEach(async () => {
        await app['product-categories:id'].delete({
            slug: 'electronics-1'
        }, {
            query: {
                slug: 'electronics-1'
            }
        })
    })

    it('should create a new ProductCategory', async () => {
        const { data, error, status } = await app['product-categories'].index.post(mockProductCategory)

        expect(error).toBeNull()
        expect(status).toEqual(200)
        expect(data).toHaveProperty('id')
    })

    it('should return 409 Conflict when adding a duplicate ProductCategory', async () => {
        const { data, error, status } = await app['product-categories'].index.post({
            ...mockProductCategory,
            slug: 'electronics-1'
        })

        expect(data).toBeNull()
        expect(status).toEqual(409)
        expect(error).toBeDefined()
        expect(error?.value).toContain('Conflict')
    })
})
