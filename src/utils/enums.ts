export enum STATUS {
    ACTIVE = 10,
    INACTIVE = 20
}

export enum PAGE {
    CURRENT = 1,
    SIZE = 12
}

export enum JWT {
    ACCESS_TOKEN_NAME = 'jwtAccessToken',
    ACCESS_TOKEN_EXP = 1 * 60 * 60, // 60 minutes
    REFRESH_TOKEN_NAME = 'jwtRefreshToken',
    REFRESH_TOKEN_EXP = 7 * 24 * 60 * 60, // 7 days
    SESSION_ID_EXP = 30 * 24 * 60 * 60 // 30 days
}

export enum REDIS_KEY {
    PRODUCT_CATEGORY = 'product_category',
    PRODUCT_BRAND = 'product_brand',
    PRODUCT_COLLECTION = 'product_collection',
    PRODUCT_COUPON = 'product_coupon',
    SYSTEM_SETTINGS = 'system_settings',

    // ** USER
    USER_SYSTEM_SETTINGS = 'user_system_settings',
    USER_HOME_FLASH_DEALS = 'user_home_flash_deals',
    USER_HOME_PRODUCT_COLLECTION = 'user_home_product_collection',
    USER_HOME_PRODUCT_CATEGORY_POPULAR = 'user_home_product_category_popular',
    USER_PRODUCT_CATEGORY = 'user_product_category',
    USER_PRODUCT_CATEGORY_RETRIEVE = 'user_product_category_retrieve',
    USER_PRODUCT = 'user_product',
    USER_WISHLIST = 'user_wishlist'
}

export enum EXPIRES_AT {
    REDIS_EXPIRES_AT = 60 * 60
}

export enum INPUT_TYPE {
    TEXT = 10,
    TEXTAREA = 20,
    SELECT = 30,
    UPLOAD = 40
}

export enum PRODUCT_TYPE {
    SINGLE = 10,
    VARIANT = 20
}

export enum SPECIAL_PRICE_TYPE {
    PRICE = 10,
    PERCENT = 20
}

export enum MANAGE_INVENTORY {
    YES = 10,
    NO = 20
}

export enum HASH_PASSWORD {
    ALGORITHM = 'argon2id'
}

export enum RELATIONS_TYPE {
    UPSELL = 10,
    CROSS_SELL = 20,
    RELATED = 30
}
