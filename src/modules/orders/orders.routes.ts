import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { makeRouteSchema } from '../shared/utils/openapi.utils';
import { placeOrder } from './use-cases/place-order';
import { cancelOrder } from './use-cases/cancel-order';
import { placeOrderSchema, cancelOrderParamsSchema, PlaceOrderData } from './orders.schemas';
import { createErrorResponse, createSuccessResponse } from '@/lib/response';

export async function orderRoutes(fastify: FastifyInstance) {
    // POST /api/orders - Place a new order
    fastify.post('/', {
        schema: makeRouteSchema({
            summary: 'Place a new order',
            tags: ['Orders'],
            body: placeOrderSchema,
            response: z.object({
                id: z.number(),
                instrumentid: z.number(),
                userid: z.number(),
                side: z.string(),
                type: z.string(),
                status: z.string(),
                datetime: z.string(),
                size: z.number()
            }).partial()
        })
    }, async (request: FastifyRequest<{ Body: PlaceOrderData }>, reply) => {
        const body = request.body;

        if (body.type === 'LIMIT' && body.price === undefined) {
            return reply.status(400).send(createErrorResponse('Cannot place a limit order without a price', 'VALIDATION_ERROR'));
        }

        if (body.type === 'MARKET' && body.price !== undefined) {
            return reply.status(400).send(createErrorResponse('Cannot place a market order with a price', 'VALIDATION_ERROR'));
        }

        const hasSize = body.size !== undefined;
        const hasCashAmount = body.cashAmount !== undefined;
        if (hasSize === hasCashAmount) {
            return reply.status(400).send(createErrorResponse('Cannot place an order with both size and cashAmount', 'VALIDATION_ERROR'));
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
        const result = await cancelOrder(request.params.orderId);
        return reply.status(200).send(createSuccessResponse(result));
    });
} 