import { FastifyInstance, FastifyRequest } from 'fastify';
import { searchInstruments } from './use-cases/search-instruments';
import { SearchInstrumentParams, SearchInstrumentParamsSchema } from './instruments.dto';
import { makeRouteSchema } from '../shared/utils/openapi.utils';
import z from 'zod';
import { createSuccessResponse, pagingResponse } from '@/lib/response';

export async function instrumentRoutes(fastify: FastifyInstance) {
    // GET /api/instruments/search - Search instruments
    fastify.get('/search', {
        schema: makeRouteSchema({
            summary: 'Search instruments',
            tags: ['Instruments'],
            querystring: SearchInstrumentParamsSchema,
            response: z.object({
                id: z.number(),
                ticker: z.string(),
                name: z.string(),
                type: z.enum(['ACCIONES', 'MONEDA'])
            }).partial().array(),
            pagination: true,
        })
    }, async (request: FastifyRequest<{ Querystring: SearchInstrumentParams }>, reply) => {
        const { query, page, pageSize } = request.query;
        const instruments = await searchInstruments({ query, page, pageSize });
        const paginationMeta = pagingResponse(page ?? 1, instruments.total, pageSize ?? 20);
        return reply
            .status(200)
            .send(
                createSuccessResponse(
                    instruments.instruments,
                    "Instruments retrieved successfully",
                    paginationMeta,
                ),
            );
    });
} 