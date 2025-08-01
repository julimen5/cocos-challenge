import { prisma } from '@/lib/prisma';
import { InstrumentType } from '@prisma/client';
import dayjs from 'dayjs';
import { OrderError } from '../order.errors';

export async function getCurrentMarketDataOrFail(instrumentId: string, instrumentType?: InstrumentType) {
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const latestMarketDataToday = await prisma.marketData.findFirst({
        where: {
            instrumentid: parseInt(instrumentId),
            /*                 date: {
                                gte: todayStart,
                                lte: todayEnd,
                            }, */
            // comment this because I don't have daily day data
            // best option is to grab today's data from the api
            // But for now, we'll use the last available data
            ...(instrumentType ? { instrument: { type: instrumentType } } : {}),
        },
        orderBy: {
            date: 'desc',
        },
    });

    if (!latestMarketDataToday) {
        throw new OrderError('No market data found for instrument', 'NO_MARKET_DATA_FOUND');
    }

    return latestMarketDataToday;
} 