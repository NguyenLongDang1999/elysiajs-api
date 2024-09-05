import { treaty } from '@elysiajs/eden'
import { describe, expect, it } from 'bun:test'
import { productCategoryController } from './product-category.controller'

const app = treaty<typeof productCategoryController>('localhost:3333/api/admin')

// const mockPrisma = {
//     user: {
//         create: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
//         findFirst: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' })
//     }
// }

// beforeEach(() => {
//     prismaClient.productCategory.create = jest.fn()
//     prismaClient.productCategory.findMany = jest.fn()
// })

describe('ProductCategoryService', () => {
    it('should return paginated list of product categories and count', async () => {
        // const productCategoryRecord = {
        //     id: '1',
        //     name: 'John Smith',
        //     slug: '123',
        //     image_uri: null,
        //     description: null,
        //     parent_id: null,
        //     status: null,
        //     meta_title: null,
        //     meta_description: null,
        //     created_at: new Date(),
        //     updated_at: new Date(),
        //     deleted_flg: false
        // } as unknown as Prisma.Prisma__ProductCategoryClient<ProductCategory>

        // spyOn(prismaClient.productCategory, 'create').mockResolvedValue(() => userRecord)

        //     const mockCount = 1

        //     prismaClient.productCategory.findMany.mockResolvedValue(mockCategories)
        //     prismaClient.productCategory.count.mockResolvedValue(mockCount)

        //     const { data, error } = await app['product-categories'].index.get({
        //         query: {
        //             page: '1',
        //             pageSize: '10',
        //             status: '10'
        //         }
        //     })

        //     expect(data).toEqual({ data: mockCategories, aggregations: mockCount })
        //     expect(prismaClient.productCategory.findMany).toHaveBeenCalled()
        //     expect(prismaClient.productCategory.count).toHaveBeenCalled()


        //     // expect(result).toEqual({ data: mockCategories, aggregations: mockCount })
    })

    it('should create a new product category and clear cache', async () => {
        const { data, error } = await app['product-categories'].index.post({
            name: 'New Category-1',
            slug: 'new-category-1'
        })

        expect(data).toBeDefined()
        expect(data).toHaveProperty('id')
        expect(error).toBeNull()
    })

    // it('should create a new product category and clear cache', async () => {
    //     const mockCategory = {
    //         name: 'Product Category Unit Test',
    //         slug: `product-category-unit-test-${Date.now()}`
    //     }

    //     prismaClient.productCategory.create.mockResolvedValue(mockCategory)

    //     const redis = redisClient
    //     redis.del = jest.fn()

    //     const { data } = await app['product-categories'].index.post(mockCategory)

    //     expect(data).toHaveProperty('id')
    //     expect(redis.del).toHaveBeenCalledWith('productCategory:list')
    // })
})
