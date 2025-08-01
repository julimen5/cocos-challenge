import { prisma } from '@/lib/prisma';
import { OrderError } from '../order.errors';
import dayjs from 'dayjs';

export async function cancelOrder(orderId: string) {
    const order = await prisma.order.findFirst({
        where: {
            id: parseInt(orderId),
        },
    });

    if (!order) {
        throw new OrderError('Order not found or does not belong to user', 'ORDER_NOT_FOUND');
    }

    if (order.status !== 'NEW') {
        throw new OrderError(`Cannot cancel order with status ${order.status}. Only NEW orders can be cancelled.`, 'ORDER_NOT_NEW');
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
} 