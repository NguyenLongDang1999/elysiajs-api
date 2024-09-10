// ** Utils Imports
import { SPECIAL_PRICE_TYPE } from '@utils/enums'

// ** Interface
export interface ProductPrice {
    price: number
    special_price: number
    special_price_type: number
    hasDiscount?: boolean
    discounted_price?: number
    discounted_price_type?: number
}

const calculateDiscountedPrice = (price: number, discount: number, discountType: SPECIAL_PRICE_TYPE) => {
    switch (discountType) {
        case SPECIAL_PRICE_TYPE.PERCENT:
            return Math.round((price - (price * discount) / 100) / 1000) * 1000
        case SPECIAL_PRICE_TYPE.PRICE:
            return price - discount
        default:
            return price
    }
}

export const formatSellingPrice = (row: ProductPrice) => {
    const { price, hasDiscount, discounted_price, discounted_price_type, special_price, special_price_type } = row

    if (hasDiscount && discounted_price && discounted_price_type) {
        return calculateDiscountedPrice(price, discounted_price, discounted_price_type)
    } else if (special_price && special_price_type) {
        return calculateDiscountedPrice(price, special_price, special_price_type)
    }

    return price
}
