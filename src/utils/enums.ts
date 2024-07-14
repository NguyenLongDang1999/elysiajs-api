export enum STATUS {
    ACTIVE = 10,
    INACTIVE = 20,
}

export enum JWT {
    ACCESS_TOKEN_EXP = 1 * 60 * 60, // 60 minutes
    REFRESH_TOKEN_EXP = 7 * 24 * 60 * 60, // 7 days
    JWT_NAME = 'jwt',
}
