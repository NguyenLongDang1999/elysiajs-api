// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Service Imports
import {
    productCollectionCreate,
    productCollectionDataList,
    productCollectionDelete,
    productCollectionRetrieve,
    productCollectionTableList,
    productCollectionUpdate
} from './product-collection.service'

export const productCollectionController = new Elysia({ prefix: '/product-collections' })
    .use(productCollectionCreate)
    .use(productCollectionUpdate)
    .use(productCollectionDelete)
    .use(productCollectionRetrieve)
    .use(productCollectionDataList)
    .use(productCollectionTableList)
