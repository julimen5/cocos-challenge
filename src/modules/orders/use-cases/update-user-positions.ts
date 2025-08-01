import { prisma } from '@/lib/prisma';

export async function updateUserPositions(
    userId: string,
    instrumentId: string,
    orderSide: 'BUY' | 'SELL',
    shares: number,
    price: number
) {
    try {
        // 1. Obtener todas las órdenes FILLED del usuario para este instrumento
        const filledOrders = await prisma.order.findMany({
            where: {
                userid: parseInt(userId),
                instrumentid: parseInt(instrumentId),
                status: 'FILLED',
                side: { in: ['BUY', 'SELL'] }
            },
            orderBy: {
                datetime: 'asc'
            }
        });

        // 2. Calcular posición actual y costo promedio
        let totalShares = 0;
        let totalCost = 0;
        let averageCost = 0;

        for (const order of filledOrders) {
            const orderPrice = parseFloat(order.price?.toString() || '0');
            const orderShares = order.size;

            if (order.side === 'BUY') {
                const cost = orderShares * orderPrice;
                totalCost += cost;
                totalShares += orderShares;
            } else if (order.side === 'SELL') {
                // Para las ventas, calculamos el costo promedio proporcional vendido
                const soldCost = (totalShares > 0) ? (orderShares * averageCost) : 0;
                totalCost -= soldCost;
                totalShares -= orderShares;
            }

            // Recalcular costo promedio después de cada operación
            if (totalShares > 0) {
                averageCost = totalCost / totalShares;
            } else {
                averageCost = 0;
                totalCost = 0;
            }
        }

        // 3. Obtener información del instrumento
        const instrument = await prisma.instrument.findUnique({
            where: {
                id: parseInt(instrumentId)
            }
        });

        return {
            success: true,
            newPosition: {
                userId: parseInt(userId),
                instrumentId: parseInt(instrumentId),
                instrumentTicker: instrument?.ticker || '',
                instrumentName: instrument?.name || '',
                shares: totalShares,
                averageCost: averageCost,
                totalCost: totalCost,
                marketValue: 0, // Se calculará cuando se obtenga el precio actual
            },
            previousShares: totalShares - (orderSide === 'BUY' ? shares : -shares),
            sharesChanged: orderSide === 'BUY' ? shares : -shares,
            orderDetails: {
                side: orderSide,
                shares,
                price,
            }
        };
    } catch (error) {
        console.error('Error updating user positions:', error);
        throw error;
    }
} 