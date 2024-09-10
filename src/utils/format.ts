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

export const formatSellingPrice = (row: ProductPrice) => {
    let discount = 0
    let sellingPrice = row.price

    if (row.hasDiscount && row.discounted_price && row.discounted_price_type) {
        switch (row.discounted_price_type) {
            case SPECIAL_PRICE_TYPE.PERCENT:
                discount = (row.price * row.discounted_price) / 100
                sellingPrice = Math.round((row.price - discount) / 1000) * 1000
                break

            case SPECIAL_PRICE_TYPE.PRICE:
                discount = row.discounted_price
                sellingPrice = row.price - discount
                break
        }
    } else {
        switch (row.special_price_type) {
            case SPECIAL_PRICE_TYPE.PERCENT:
                discount = (row.price * row.special_price) / 100
                sellingPrice = Math.round((row.price - discount) / 1000) * 1000
                break

            case SPECIAL_PRICE_TYPE.PRICE:
                discount = row.special_price
                sellingPrice = row.price - discount
                break
        }
    }

    return sellingPrice
}
