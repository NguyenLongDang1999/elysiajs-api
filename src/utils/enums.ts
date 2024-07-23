export enum STATUS {
    ACTIVE = 10,
    INACTIVE = 20
}

export enum JWT {
    ACCESS_TOKEN_EXP = 1 * 60 * 60, // 60 minutes
    REFRESH_TOKEN_EXP = 7 * 24 * 60 * 60, // 7 days
    JWT_NAME = 'jwt'
}

export enum REDIS_KEY {
    PRODUCT_CATEGORY = 'product_category',
    SYSTEM_SETTINGS = 'system_settings'
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
