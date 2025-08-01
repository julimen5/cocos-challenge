import { describe, it, expect, beforeEach, mock } from "bun:test";
import { placeOrder } from '@/modules/orders/use-cases/place-order';

// Mock only Prisma - let all business logic functions run normally
const mockPrisma = {
    order: {
        create: mock(() => Promise.resolve({
            id: 1,
            instrumentid: 1,
            userid: 1,
            side: 'BUY',
            size: 10,
            price: '148.00',
            type: 'MARKET',
            status: 'FILLED',
            datetime: new Date().toISOString(),
            reason: null
        })),
        findFirst: mock(() => Promise.resolve(null)),
        findMany: mock(() => Promise.resolve([
            // Mock some cash positions for getAvailableCash calculation
            {
                id: 1,
                instrumentid: 2,
                userid: 1,
                side: 'CASH_IN',
                size: 100000,
                price: '1.00',
                type: 'MARKET',
                status: 'FILLED',
                datetime: new Date().toISOString(),
                reason: null,
                instrument: {
                    id: 2,
                    ticker: 'ARS',
                    name: 'ARS Cash',
                    type: 'MONEDA'
                }
            }
        ]))
    },
    marketData: {
        findFirst: mock(() => Promise.resolve({
            id: 1,
            instrumentid: 1,
            high: 150,
            low: 140,
            open: 145,
            close: 148,
            previousclose: 145,
            date: new Date()
        }))
    },
    instrument: {
        findFirst: mock(() => Promise.resolve({
            id: 2,
            ticker: 'ARS',
            name: 'ARS Cash',
            type: 'MONEDA'
        }))
    },
    $transaction: mock((callback) => callback(mockPrisma))
};

// Apply only Prisma mock - all other functions will run their real logic
mock.module('@/lib/prisma', () => ({
    prisma: mockPrisma
}));

describe('Place Order - Functional Tests (MOCKED DB ONLY)', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        mockPrisma.order.create.mockClear();
        mockPrisma.order.findFirst.mockClear();
        mockPrisma.order.findMany.mockClear();
        mockPrisma.marketData.findFirst.mockClear();
        mockPrisma.instrument.findFirst.mockClear();
        mockPrisma.$transaction.mockClear();

        // Reset to default successful responses
        mockPrisma.marketData.findFirst.mockResolvedValue({
            id: 1,
            instrumentid: 1,
            high: 150,
            low: 140,
            open: 145,
            close: 148,
            previousclose: 145,
            date: new Date()
        });

        // Mock cash positions for getAvailableCash (ARS currency instrument with id 2)
        mockPrisma.order.findMany.mockResolvedValue([
            {
                id: 1,
                instrumentid: 2, // ARS cash instrument
                userid: 1,
                side: 'CASH_IN',
                size: 100000,
                price: '1.00',
                type: 'MARKET',
                status: 'FILLED',
                datetime: new Date().toISOString(),
                reason: null,
                instrument: {
                    id: 2,
                    ticker: 'ARS',
                    name: 'ARS Cash',
                    type: 'MONEDA'
                }
            }
        ]);

        // Mock cash instrument lookup
        mockPrisma.instrument.findFirst.mockResolvedValue({
            id: 2,
            ticker: 'ARS',
            name: 'ARS Cash',
            type: 'MONEDA'
        });

        mockPrisma.order.create.mockResolvedValue({
            id: 1,
            instrumentid: 1,
            userid: 1,
            side: 'BUY',
            size: 10,
            price: '148.00',
            type: 'MARKET',
            status: 'FILLED',
            datetime: new Date().toISOString(),
            reason: null
        });
    });

    describe('Market Order BUY - Business Logic', () => {
        it('should successfully place market BUY order with size', async () => {
            const orderData = {
                instrumentId: '1',
                userId: '1',
                side: 'BUY' as const,
                type: 'MARKET' as const,
                size: 10
            };

            const result = await placeOrder(orderData);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.status).toBe('FILLED');
            expect(result.side).toBe('BUY');
            expect(result.type).toBe('MARKET');
            expect(result.size).toBe(10);
            expect(Number(result.price)).toBe(148);

            // Verify Prisma methods were called (real business logic executed)
            expect(mockPrisma.marketData.findFirst).toHaveBeenCalled(); // getCurrentMarketDataOrFail
            expect(mockPrisma.order.findMany).toHaveBeenCalled(); // getAvailableCash
            expect(mockPrisma.instrument.findFirst).toHaveBeenCalled(); // getCashInstrument
            expect(mockPrisma.order.create).toHaveBeenCalled(); // Final order creation
        });

        it('should successfully place market BUY order with cashAmount', async () => {
            const orderData = {
                instrumentId: '1',
                userId: '1',
                side: 'BUY' as const,
                type: 'MARKET' as const,
                cashAmount: 1500
            };

            const result = await placeOrder(orderData);

            expect(result).toBeDefined();
            expect(result.status).toBe('FILLED');
            expect(result.side).toBe('BUY');
            expect(result.type).toBe('MARKET');

            // Real calculateOrderSizeAndPrice logic: 1500 / 148 = 10.13 -> floor(10.13) = 10
            // Verify database calls were made
            expect(mockPrisma.marketData.findFirst).toHaveBeenCalled();
            expect(mockPrisma.order.findMany).toHaveBeenCalled();
        });

        it('should reject market BUY order when insufficient funds', async () => {
            // Mock insufficient cash - return orders with low cash balance
            mockPrisma.order.findMany.mockResolvedValueOnce([
                {
                    id: 1,
                    instrumentid: 2,
                    userid: 1,
                    side: 'CASH_IN',
                    size: 1000, // Only $1000 available
                    price: '1.00',
                    type: 'MARKET',
                    status: 'FILLED',
                    datetime: new Date().toISOString(),
                    reason: null,
                    instrument: {
                        id: 2,
                        ticker: 'ARS',
                        name: 'ARS Cash',
                        type: 'MONEDA'
                    }
                }
            ]);

            mockPrisma.order.create.mockResolvedValueOnce({
                id: 1,
                instrumentid: 1,
                userid: 1,
                side: 'BUY',
                size: 1000,
                price: '148.00',
                type: 'MARKET',
                status: 'REJECTED',
                datetime: new Date().toISOString(),
                reason: 'Insufficient funds'
            });

            const orderData = {
                instrumentId: '1',
                userId: '1',
                side: 'BUY' as const,
                type: 'MARKET' as const,
                size: 1000 // 1000 * 148 = 148,000 > 1000 available cash
            };

            const result = await placeOrder(orderData);

            expect(result).toBeDefined();
            expect(result.status).toBe('REJECTED');
            expect(result.reason).toBe('Insufficient funds');
            expect(result.side).toBe('BUY');
            expect(result.type).toBe('MARKET');

            // Verify real getAvailableCash logic was executed
            expect(mockPrisma.order.findMany).toHaveBeenCalled();
        });

        it('should reject market BUY order when cashAmount too low', async () => {
            mockPrisma.order.create.mockResolvedValueOnce({
                id: 1,
                instrumentid: 1,
                userid: 1,
                side: 'BUY',
                size: 0,
                price: null,
                type: 'MARKET',
                status: 'REJECTED',
                datetime: new Date().toISOString(),
                reason: 'Cash amount too low to buy any shares'
            });

            const orderData = {
                instrumentId: '1',
                userId: '1',
                side: 'BUY' as const,
                type: 'MARKET' as const,
                cashAmount: 50 // 50 / 148 = 0.33 -> floor(0.33) = 0
            };

            const result = await placeOrder(orderData);

            expect(result).toBeDefined();
            expect(result.status).toBe('REJECTED');
            expect(result.reason).toBe('Cash amount too low to buy any shares');
            expect(result.side).toBe('BUY');
            expect(result.type).toBe('MARKET');
        });

        it('should reject market BUY order when no price available', async () => {
            // Mock no market data found
            mockPrisma.marketData.findFirst.mockResolvedValueOnce(null);

            mockPrisma.order.create.mockResolvedValueOnce({
                id: 1,
                instrumentid: 999,
                userid: 1,
                side: 'BUY',
                size: 0,
                price: null,
                type: 'MARKET',
                status: 'REJECTED',
                datetime: new Date().toISOString(),
                reason: 'No price found for instrument'
            });

            const orderData = {
                instrumentId: '999',
                userId: '1',
                side: 'BUY' as const,
                type: 'MARKET' as const,
                size: 10
            };

            const result = await placeOrder(orderData);

            expect(result).toBeDefined();
            expect(result.status).toBe('REJECTED');
            expect(result.reason).toBe('No price found for instrument');
            expect(result.side).toBe('BUY');
            expect(result.type).toBe('MARKET');

            // Verify real getCurrentMarketDataOrFail logic was executed
            expect(mockPrisma.marketData.findFirst).toHaveBeenCalled();
        });

        it('should handle successful market BUY order with CASH_OUT creation', async () => {
            const orderData = {
                instrumentId: '1',
                userId: '1',
                side: 'BUY' as const,
                type: 'MARKET' as const,
                size: 5
            };

            const result = await placeOrder(orderData);

            expect(result).toBeDefined();
            expect(result.status).toBe('FILLED');
            expect(result.side).toBe('BUY');

            // Verify transaction was called (CASH_OUT order creation)
            expect(mockPrisma.$transaction).toHaveBeenCalled();
            // Verify real getCashInstrument logic was executed
            expect(mockPrisma.instrument.findFirst).toHaveBeenCalled();
        });

        it('should place successful LIMIT BUY order (not executed)', async () => {
            mockPrisma.order.create.mockResolvedValueOnce({
                id: 1,
                instrumentid: 1,
                userid: 1,
                side: 'BUY',
                size: 10,
                price: '140.00',
                type: 'LIMIT',
                status: 'NEW',
                datetime: new Date().toISOString(),
                reason: null
            });

            const orderData = {
                instrumentId: '1',
                userId: '1',
                side: 'BUY' as const,
                type: 'LIMIT' as const,
                size: 10,
                price: 140 // Below current market price
            };

            const result = await placeOrder(orderData);

            expect(result).toBeDefined();
            expect(result.status).toBe('NEW'); // LIMIT orders start as NEW
            expect(result.side).toBe('BUY');
            expect(result.type).toBe('LIMIT');
            expect(result.size).toBe(10);
            expect(Number(result.price)).toBe(140);

            // Verify real business logic was executed
            expect(mockPrisma.marketData.findFirst).toHaveBeenCalled();
            expect(mockPrisma.order.findMany).toHaveBeenCalled();
        });

        it('should handle invalid instrumentId gracefully', async () => {
            // Mock error for invalid instrument - no market data
            mockPrisma.marketData.findFirst.mockResolvedValueOnce(null);

            mockPrisma.order.create.mockResolvedValueOnce({
                id: 1,
                instrumentid: 999999,
                userid: 1,
                side: 'BUY',
                size: 0,
                price: null,
                type: 'MARKET',
                status: 'REJECTED',
                datetime: new Date().toISOString(),
                reason: 'No price found for instrument'
            });

            const orderData = {
                instrumentId: '999999',
                userId: '1',
                side: 'BUY' as const,
                type: 'MARKET' as const,
                size: 10
            };

            const result = await placeOrder(orderData);

            // Should create a rejected order instead of throwing
            expect(result).toBeDefined();
            expect(result.status).toBe('REJECTED');
            expect(result.reason).toBe('No price found for instrument');

            // Verify real getCurrentMarketDataOrFail logic was executed
            expect(mockPrisma.marketData.findFirst).toHaveBeenCalled();
        });
    });
});