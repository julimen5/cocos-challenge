import { prisma } from '@/lib/prisma';

export async function getAvailableCash(userId: string) {
    const cashFlow = await prisma.order.findMany({
        where: {
            userid: +userId,
            status: 'FILLED',
            side: {
                in: ['CASH_IN', 'CASH_OUT'],
            },
            instrument: {
                type: 'MONEDA'
            }
        },
    });

    const availableCash = cashFlow.reduce((acc, order) => {
        if (order.side === 'CASH_IN') {
            return acc + (order.size ?? 0);
        }
        return acc - (order.size ?? 0);
    }, 0);

    return availableCash;
} 