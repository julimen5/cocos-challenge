import { prisma } from '@/lib/prisma';

export async function executeMarketOrder(orderId: string) {
    try {
        // 1. Buscar la orden
        const order = await prisma.order.findUnique({
            where: {
                id: parseInt(orderId),
            },
        });

        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        // 2. Validar que sea una orden MARKET
        if (order.type !== 'MARKET') {
            throw new Error(`Order ${orderId} is not a MARKET order`);
        }

        // 3. Actualizar el estado a FILLED y marcar timestamp de ejecución
        const executedOrder = await prisma.order.update({
            where: {
                id: parseInt(orderId),
            },
            data: {
                status: 'FILLED',
                datetime: new Date(), // Actualizar con el timestamp de ejecución
            },
        });

        return {
            orderId: executedOrder.id,
            executedPrice: parseFloat(executedOrder.price?.toString() || '0'),
            executedAt: executedOrder.datetime,
            status: 'FILLED',
            side: executedOrder.side,
            size: executedOrder.size,
            instrumentId: executedOrder.instrumentid,
            userId: executedOrder.userid,
        };
    } catch (error) {
        console.error('Error executing market order:', error);
        throw error;
    }
} 