import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { makeRouteSchema } from '../shared/utils/openapi.utils';
import { placeOrder } from './use-cases/place-order';
import { cancelOrder } from './use-cases/cancel-order';
import { placeOrderSchema, cancelOrderParamsSchema } from './orders.schemas';
import { createErrorResponse, createSuccessResponse } from '@/lib/response';

export async function orderRoutes(fastify: FastifyInstance) {
    // POST /api/orders - Place a new order
    fastify.post('/', {
        schema: makeRouteSchema({
            summary: 'Place a new order',
            tags: ['Orders'],
            body: placeOrderSchema,
            response: z.any()
        })
    }, async (request: FastifyRequest<{ Body: z.infer<typeof placeOrderSchema> }>, reply) => {
        const body = request.body;

        if (body.type === 'LIMIT' && body.price === undefined) {
            return reply.status(400).send(createErrorResponse('Se debe enviar price cuando type es LIMIT', 'VALIDATION_ERROR'));
        }

        if (body.type === 'MARKET' && body.price !== undefined) {
            return reply.status(400).send(createErrorResponse('No se debe enviar price cuando type es MARKET', 'VALIDATION_ERROR'));
        }

        const hasSize = body.size !== undefined;
        const hasCashAmount = body.cashAmount !== undefined;
        if (hasSize === hasCashAmount) {
            return reply.status(400).send(createErrorResponse('Debes enviar solo uno: size o cashAmount', 'VALIDATION_ERROR'));
        }

        const result = await placeOrder(request.body);
        return reply.status(201).send(createSuccessResponse(result));
    });

    // PATCH /api/orders/:orderId/cancel - Cancel an order
    fastify.patch('/:orderId/cancel', {
        schema: makeRouteSchema({
            summary: 'Cancel an order',
            tags: ['Orders'],
            params: cancelOrderParamsSchema,
            response: z.any()
        })
    }, async (request: FastifyRequest<{ Params: { orderId: string } }>, reply) => {
        // TODO: Get userId from authentication when implemented
        const result = await cancelOrder(request.params.orderId, 'temp-user-id');
        return reply.status(200).send(createSuccessResponse(result));
    });
} 