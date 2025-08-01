import { prisma } from '@/lib/prisma';
import { InstrumentType } from '@prisma/client';
import dayjs from 'dayjs';

export async function getCurrentMarketDataOrFail(instrumentId: string, instrumentType?: InstrumentType) {
    try {
        const todayStart = dayjs().startOf('day').toDate();
        const todayEnd = dayjs().endOf('day').toDate();

        const latestMarketDataToday = await prisma.marketData.findFirst({
            where: {
                instrumentid: parseInt(instrumentId),
                /*                 date: {
                                    gte: todayStart,
                                    lte: todayEnd,
                                }, */
                ...(instrumentType ? { instrument: { type: instrumentType } } : {}),
            },
            orderBy: {
                date: 'desc',
            },
        });

        if (!latestMarketDataToday) {
            throw new Error('No market data found for instrument');
        }

        return latestMarketDataToday;
    } catch (error) {
        console.error('Error getting current price:', error);
        throw error;
    }
} 