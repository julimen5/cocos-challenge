import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { swaggerConfig } from '@/lib/swagger';
import { registerRoutes } from './routes';
import { logger } from './lib/logger';

// Import routes

export async function createApp() {
    const app = fastify({
        logger: false,
        ajv: {
            customOptions: {
                allErrors: true,
                strict: true,
                strictSchema: false, // Allow unknown keywords for OpenAPI compatibility
                removeAdditional: false, // Don't remove additional properties, just validate against them
            },
        },
    });

    app.addHook("onRequest", (req, reply, done) => {
        // asyncContext.run({ trackingId: randomUUID() }, done);
        req.startTime = process.hrtime();
        done();
    });

    // Log completed responses
    app.addHook("onSend", (req, reply, payload, done) => {
        const log = reply.statusCode >= 400 ? logger.error : logger.info;
        const [seconds, nanoseconds] = process.hrtime(req.startTime);
        const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
        log(`Request completed`, {
            method: req.method,
            url: req.url,
            statusCode: reply.statusCode,
            responseBody: payload,
            // trackingId: asyncContext.getStore()?.trackingId,
            durationMs,
        });
        done();
    });

    // Register plugins
    await app.register(helmet);
    await app.register(cors, {
        origin: process.env.CORS_ORIGIN || true,
    });

    // Swagger
    await app.register(swagger, swaggerConfig);
    await app.register(swaggerUI, {
        routePrefix: '/docs',
    });

    await registerRoutes(app);


    return app;
} 