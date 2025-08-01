import { prisma } from '@/lib/prisma';
import { getCurrentMarketData } from './get-current-price';

export async function calculateOrderSize(
    instrumentId: string,
    cashAmount: number,
    orderType: 'MARKET' | 'LIMIT',
    limitPrice?: number
) {
    try {
        let pricePerShare: number;

        if (orderType === 'MARKET') {
            // Para órdenes MARKET, usar el precio actual del mercado
            const priceData = await getCurrentMarketData(instrumentId);
            pricePerShare = priceData.currentPrice;
        } else if (orderType === 'LIMIT' && limitPrice) {
            // Para órdenes LIMIT, usar el precio límite especificado
            pricePerShare = limitPrice;
        } else {
            throw new Error('LIMIT orders require a limit price');
        }

        if (pricePerShare <= 0) {
            throw new Error('Invalid price per share');
        }

        // Calcular el número máximo de acciones (sin fracciones)
        const maxShares = Math.floor(cashAmount / pricePerShare);
        const totalCost = maxShares * pricePerShare;
        const remainingCash = cashAmount - totalCost;

        return {
            maxShares,
            estimatedPrice: pricePerShare,
            totalCost,
            remainingCash,
            cashAmount,
        };
    } catch (error) {
        console.error('Error calculating order size:', error);
        throw error;
    }
} 