import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { placeOrder } from '@/modules/orders/use-cases/place-order';
import {
    cleanupDatabase,
    createTestUser,
    createTestInstrument,
    createTestMarketData
} from '../setup/test-helpers';

describe('Place Order', () => {
    let testUser: any;
    let testInstrument: any;

    beforeEach(async () => {
        await cleanupDatabase();
        testUser = await createTestUser();
        testInstrument = await createTestInstrument();
        await createTestMarketData(testInstrument.id);
    });

    afterEach(async () => {
        await cleanupDatabase();
    });

    it('should place a market buy order successfully', async () => {
        const orderData = {
            instrumentId: testInstrument.id,
            userId: testUser.id,
            side: 'BUY' as const,
            type: 'MARKET' as const,
            size: 10,
        };

        const result = await placeOrder(orderData);

        expect(result).toBeDefined();
        expect(result.orderId).toBeDefined();
        expect(result.status).toBe('NEW');
    });

    it('should place a limit sell order successfully', async () => {
        const orderData = {
            instrumentId: testInstrument.id,
            userId: testUser.id,
            side: 'SELL' as const,
            type: 'LIMIT' as const,
            size: 5,
            price: 150,
        };

        const result = await placeOrder(orderData);

        expect(result).toBeDefined();
        expect(result.orderId).toBeDefined();
        expect(result.status).toBe('NEW');
    });

    // TODO: Add more test cases
    // - Test with cash amount instead of size
    // - Test validation errors
    // - Test insufficient funds
    // - Test CASH_IN/CASH_OUT orders
}); 