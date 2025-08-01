import 'dotenv/config';
import { createApp } from './app';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

async function start() {
    try {
        await prisma.$connect();
        logger.info('Database connected successfully');

        const app = await createApp();

        const port = Number(process.env.PORT) || 3000;
        const host = process.env.HOST || '0.0.0.0';

        await app.listen({ port, host });

        logger.info(`🚀 Server started successfully`, {
            port,
            host,
            docs: `http://${host}:${port}/docs`,
            environment: process.env.NODE_ENV || 'development',
        });

    } catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
}

start(); 