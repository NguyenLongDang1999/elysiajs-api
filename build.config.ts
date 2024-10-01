export default {
    entries: ['./src/index'],
    externals: [
        '@utils/enums',
        '@utils/error-handling',
        '@utils/format',
        '@libs/ioredis',
        '@src/database/prisma',
        '@src/types/core.type'
    ],  // Mark these as external dependencies
    rollup: {
        emitCJS: true  // If you need to support CommonJS
    }
}
