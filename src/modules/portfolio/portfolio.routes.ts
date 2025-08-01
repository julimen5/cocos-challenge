import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { makeRouteSchema } from '../shared/utils/openapi.utils';
import { calculatePortfolio } from './use-cases/calculate-portfolio';
import { createSuccessResponse } from '@/lib/response';

export async function portfolioRoutes(fastify: FastifyInstance) {
    // GET /api/portfolio/:userId - Get user portfolio
    fastify.get('/:id', {
        schema: makeRouteSchema({
            summary: 'Get user portfolio',
            tags: ['Portfolio'],
            params: z.object({ id: z.string() }),
            response: z.any()
        })
    }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {

        const portfolio = await calculatePortfolio(request.params.id);

        return reply.status(200).send(createSuccessResponse(portfolio));
    });
} 