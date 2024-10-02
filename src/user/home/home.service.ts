// ** Elysia Imports
import { Elysia } from 'elysia'

// ** Utils Imports
import { handleDatabaseError } from '@utils/error-handling'

// ** Class Imports
import { UserSystemSettingsClass } from '../system-settings/system-settings.class'
import { HomeClass } from './home.class'

// ** Plugins Imports
import { redisPlugin } from '@src/plugins/redis'
import { authUserPlugin } from '../plugins/auth'

export const homeData = new Elysia()
    .decorate({
        HomeClass: new HomeClass(),
        UserSystemSettingsClass: new UserSystemSettingsClass()
    })
    .use(redisPlugin)
    .use(authUserPlugin)
    .get('/data', async ({ HomeClass, UserSystemSettingsClass, redis, user }) => {
        try {
            const systemSettings = await UserSystemSettingsClass.getDataList({ key: 'home_' }, redis)

            const homeSystem = (key: string) =>
                systemSettings.find((system: { key: string | string[] }) => system.key.includes(key))

            const getParseValueWithKey = (key: string) => {
                const system = homeSystem(key)

                return system && system.key === key ? JSON.parse(system.value) : []
            }

            const slider = getParseValueWithKey('home_slider')
            const product_category_popular = getParseValueWithKey('home_product_categories_popular')
            const product_collection = getParseValueWithKey('home_product_collection')
            const product_flash_deals = getParseValueWithKey('home_product_flash_deals')

            const flashDealData = await HomeClass.getProductFlashDeals(product_flash_deals, redis, user?.id)
            const productCategoryData = await HomeClass.getProductCategoryPopular(product_category_popular, redis)
            const productCollectionData = await HomeClass.getProductCollection(product_collection, redis, user?.id)

            return {
                slider,
                product_flash_deals: flashDealData,
                product_collection: productCollectionData,
                product_categories_popular: productCategoryData
            }
        } catch (error) {
            handleDatabaseError(error)
        }
    })
