import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

export async function cancelOrder(orderId: string, userId: string) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                id: parseInt(orderId),
                userid: parseInt(userId),
            },
        });

        if (!order) {
            throw new Error('Order not found or does not belong to user');
        }

        if (order.status !== 'NEW') {
            throw new Error(`Cannot cancel order with status ${order.status}. Only NEW orders can be cancelled.`);
        }

        const cancelledOrder = await prisma.order.update({
            where: {
                id: parseInt(orderId),
            },
            data: {
                status: 'CANCELLED',
                datetime: dayjs().toDate(), // Update datetime to mark when it was cancelled
            },
        });

        return cancelledOrder;
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
} 