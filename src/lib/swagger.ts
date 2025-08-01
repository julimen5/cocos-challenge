export const swaggerConfig = {
    swagger: {
        info: {
            title: 'Trading API',
            description: 'Cocos Trading Challenge API',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
            { name: 'Portfolio', description: 'Portfolio management endpoints' },
            { name: 'Instruments', description: 'Instrument search endpoints' },
            { name: 'Orders', description: 'Order management endpoints' },
        ],
    },
    exposeRoute: true,
}; 