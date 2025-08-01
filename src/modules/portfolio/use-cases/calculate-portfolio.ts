import { getAvailableCash } from './get-available-cash';
import { fetchUserOrders, aggregateUserPositions, calculatePositionValue } from '../services/position.service';
import { PortfolioSummary } from '../types/portfolio.types';
import { logger } from '@/lib/logger';

export async function calculatePortfolio(userId: string): Promise<PortfolioSummary> {
    const log = logger.child({ userId, scope: 'calculatePortfolio' });
    // Get available cash
    const availableCash = await getAvailableCash(userId);
    log.info('Available cash', { availableCash });

    // Get user's filled orders for stocks
    const orders = await fetchUserOrders(userId);
    log.info('Orders', { orders });

    // Aggregate positions from orders
    const rawPositions = aggregateUserPositions(orders);
    log.info('Raw positions', { rawPositions });
    // Get unique instrument IDs that have positions
    const instrumentIds = Object.keys(rawPositions).map(Number);

    // Calculate enriched positions with market data
    const positions = await calculatePositionValue(rawPositions, instrumentIds);
    log.info('Positions', { positions });
    return {
        totalValue: availableCash + positions.reduce((acc, p) => acc + p.value, 0),
        availableCash,
        positions,
    };
} 