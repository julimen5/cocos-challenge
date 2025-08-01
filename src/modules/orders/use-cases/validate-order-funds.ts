import { prisma } from '@/lib/prisma';
import { getCurrentMarketData } from './get-current-price';

export async function validateOrderFunds(
    userId: string,
    side: 'BUY' | 'SELL',
    instrumentId: string,
    size: number,
    price?: number
) {
    try {
        if (side === 'BUY') {
            return await validateBuyOrderFunds(userId, instrumentId, size, price);
        } else {
            return await validateSellOrderFunds(userId, instrumentId, size);
        }
    } catch (error) {
        console.error('Error validating order funds:', error);
        return {
            isValid: false,
            availableFunds: 0,
            requiredFunds: 0,
            message: 'Error validating funds',
        };
    }
}

async function validateBuyOrderFunds(
    userId: string,
    instrumentId: string,
    size: number,
    price?: number
) {
    // 1. Obtener precio por acción
    let pricePerShare = price;
    if (!pricePerShare) {
        const priceData = await getCurrentMarketData(instrumentId);
        pricePerShare = priceData.currentPrice;
    }

    const requiredFunds = size * pricePerShare;

    // 2. Calcular cash disponible del usuario
    // Buscar instrumento ARS (MONEDA)
    const arsInstrument = await prisma.instrument.findFirst({
        where: {
            type: 'MONEDA',
            ticker: 'ARS'
        }
    });

    if (!arsInstrument) {
        throw new Error('ARS currency instrument not found');
    }

    // 3. Sumar todas las órdenes FILLED que afectan el cash del usuario
    const cashMovements = await prisma.order.findMany({
        where: {
            userid: parseInt(userId),
            status: 'FILLED',
            OR: [
                { side: 'CASH_IN' },
                { side: 'CASH_OUT' },
                {
                    AND: [
                        { side: 'BUY' },
                        { instrumentid: { not: arsInstrument.id } }
                    ]
                },
                {
                    AND: [
                        { side: 'SELL' },
                        { instrumentid: { not: arsInstrument.id } }
                    ]
                }
            ]
        }
    });

    let availableCash = 0;
    for (const movement of cashMovements) {
        if (movement.side === 'CASH_IN') {
            availableCash += movement.size;
        } else if (movement.side === 'CASH_OUT') {
            availableCash -= movement.size;
        } else if (movement.side === 'BUY') {
            // Al comprar, se gasta cash (size * price)
            const cost = movement.size * parseFloat(movement.price?.toString() || '0');
            availableCash -= cost;
        } else if (movement.side === 'SELL') {
            // Al vender, se recibe cash (size * price)
            const income = movement.size * parseFloat(movement.price?.toString() || '0');
            availableCash += income;
        }
    }

    const isValid = availableCash >= requiredFunds;

    return {
        isValid,
        availableFunds: availableCash,
        requiredFunds,
        message: isValid ? '' : `Insufficient funds. Available: ${availableCash}, Required: ${requiredFunds}`,
    };
}

async function validateSellOrderFunds(
    userId: string,
    instrumentId: string,
    size: number
) {
    // Calcular posición actual del usuario en este instrumento
    const orders = await prisma.order.findMany({
        where: {
            userid: parseInt(userId),
            instrumentid: parseInt(instrumentId),
            status: 'FILLED',
            side: { in: ['BUY', 'SELL'] }
        }
    });

    let currentPosition = 0;
    for (const order of orders) {
        if (order.side === 'BUY') {
            currentPosition += order.size;
        } else if (order.side === 'SELL') {
            currentPosition -= order.size;
        }
    }

    const isValid = currentPosition >= size;

    return {
        isValid,
        availableFunds: currentPosition,
        requiredFunds: size,
        message: isValid ? '' : `Insufficient shares. Available: ${currentPosition}, Required: ${size}`,
    };
} 