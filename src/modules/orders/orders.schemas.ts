import { z } from 'zod';

// Order request/response schemas will be defined here
export const placeOrderSchema = z.object({
    instrumentId: z.string(),
    userId: z.string(), // TODO: Remove this field when authentication is implemented
    side: z.enum(['BUY', 'SELL']),
    type: z.enum(['MARKET', 'LIMIT']),
    size: z.number().int().min(1).max(1000000).optional(),
    cashAmount: z.number().min(0.01).max(10000000).optional(),
    price: z.number().min(0.01).max(1000000).optional(),
});

export const cancelOrderParamsSchema = z.object({
    orderId: z.string(),
});
export type PlaceOrderData = z.infer<typeof placeOrderSchema>;
