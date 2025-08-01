import { Order, MarketData, Prisma } from '@prisma/client';
import { Position, RawPosition } from '../types/portfolio.types';
import { prisma } from '@/lib/prisma';

export async function fetchUserOrders(userId: string, instrumentId?: number) {
    const orders = await prisma.order.findMany({
        select: {
            id: true,
            instrumentid: true,
            size: true,
            price: true,
            side: true
        },
        where: {
            userid: +userId,
            status: 'FILLED',
            side: {
                in: ['BUY', 'SELL'],
            },
            instrument: {
                type: 'ACCIONES',
                ...(instrumentId ? { id: instrumentId } : {})
            }
        },
    });
    return orders;
}

export async function fetchMarketData(instrumentIds: number[]): Promise<Map<number, MarketData>> {
    if (instrumentIds.length === 0) {
        return new Map();
    }

    const marketData = await prisma.$queryRaw<MarketData[]>`
    SELECT DISTINCT ON (instrumentid) *
    FROM "marketdata"
    WHERE instrumentid IN (${Prisma.join(instrumentIds)})
    ORDER BY instrumentid,
             CASE WHEN date::date = CURRENT_DATE THEN 0 ELSE 1 END,
             date DESC`;

    console.log(marketData);

    return new Map(marketData.map(m => [m.instrumentid, m]));
}

export function aggregateUserPositions(orders: Pick<Order, 'instrumentid' | 'size' | 'price' | 'side'>[]): Record<number, RawPosition> {
    return orders.reduce((acc, order) => {
        const size = Number(order.size ?? 0);
        const price = Number(order.price ?? 0);

        if (acc[order.instrumentid]) {
            const existing = acc[order.instrumentid];
            acc[order.instrumentid] = {
                q: order.side === 'BUY' ? existing.q + size : existing.q - size,
                qTotal: order.side === 'BUY' ? existing.qTotal + size : existing.qTotal, // qTotal is the total quantity of the position without considering the sells
                sumTotal: order.side === 'BUY' ? existing.sumTotal + (size * price) : existing.sumTotal,
            };
        } else {
            acc[order.instrumentid] = {
                q: order.side === 'BUY' ? size : -size,
                qTotal: order.side === 'BUY' ? size : 0,
                sumTotal: order.side === 'BUY' ? size * price : 0,
            };
        }
        return acc;
    }, {} as Record<number, RawPosition>);
}

export const calculatePositionValue = async (rawPositions: Record<number, RawPosition>, instrumentIds: number[]) => {
    console.log('rawPositions', rawPositions);
    console.log('instrumentIds', instrumentIds);
    const marketDataMap = await fetchMarketData(instrumentIds);
    console.log('marketDataMap', marketDataMap);
    const positions: Position[] = Object.entries(rawPositions)
        .filter(([_, v]) => v.q !== 0 && v.qTotal > 0)
        .map(([instrumentid, v]) => {
            const market = marketDataMap.get(Number(instrumentid));
            if (!market) return null;

            const avgPrice = v.qTotal !== 0 ? v.sumTotal / v.qTotal : 0;
            const currentPrice = Number(market.close ?? 0);
            const value = v.q * currentPrice;
            const side: 'long' | 'short' = v.q >= 0 ? 'long' : 'short';
            const performance = avgPrice !== 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
            const realPerformance = side === 'long'
                ? performance
                : avgPrice !== 0 ? ((avgPrice - currentPrice) / avgPrice) * 100 : 0;

            return {
                instrumentid: Number(instrumentid),
                quantity: v.q,
                avgPrice,
                currentPrice,
                value,
                performance,
                side,
                realPerformance,
            };
        })
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
    return positions
}
