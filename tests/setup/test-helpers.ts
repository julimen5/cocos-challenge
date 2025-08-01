// Test helper utilities

import { prisma } from '@/lib/prisma';

export async function cleanupDatabase() {
    // Clean up test data in reverse order of dependencies
    await prisma.order.deleteMany();
    await prisma.marketData.deleteMany();
    await prisma.instrument.deleteMany();
    await prisma.user.deleteMany();
}

export async function createTestUser() {
    return await prisma.user.create({
        data: {
            email: 'test@example.com',
            accountNumber: 'TEST-001',
        },
    });
}

export async function createTestInstrument() {
    return await prisma.instrument.create({
        data: {
            ticker: 'TEST',
            name: 'Test Stock',
            type: 'STOCK',
        },
    });
}

export async function createTestMarketData(instrumentId: string) {
    return await prisma.marketData.create({
        data: {
            instrumentId,
            high: 150,
            low: 140,
            open: 145,
            close: 148,
            previousClose: 145,
            volume: 1000,
            datetime: new Date(),
        },
    });
}

// Add more test helpers as needed 