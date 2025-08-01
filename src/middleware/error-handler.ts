import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@/lib/logger';
import { createErrorResponse } from '@/lib/response';

export async function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    logger.error('Request error', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
    });

    // Handle Zod validation errors
    if (error.validation) {
        return reply.status(400).send(
            createErrorResponse('Validation error', 'VALIDATION_ERROR')
        );
    }

    // Handle Prisma errors
    if (error.message.includes('Prisma')) {
        return reply.status(500).send(
            createErrorResponse('Database error', 'DATABASE_ERROR')
        );
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send(
        createErrorResponse(error.message || 'Internal server error', 'INTERNAL_ERROR')
    );
} 