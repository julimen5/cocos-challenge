import { getAvailableCash } from './get-available-cash';
import { fetchUserOrders, aggregateUserPositions, calculatePositionValue } from '../services/position.service';
import { PortfolioSummary } from '../types/portfolio.types';
import { logger } from '@/lib/logger';

export async function calculatePortfolio(userId: string): Promise<PortfolioSummary> {
    const log = logger.child({ userId, scope: 'calculatePortfolio' });
    try {
        // Get available cash
        const availableCash = await getAvailableCash(userId);

        // Get user's filled orders for stocks
        const orders = await fetchUserOrders(userId);

        // Aggregate positions from orders
        const rawPositions = aggregateUserPositions(orders);

        // Get unique instrument IDs that have positions
        const instrumentIds = Object.keys(rawPositions).map(Number);

        // Calculate enriched positions with market data
        const positions = await calculatePositionValue(rawPositions, instrumentIds);

        return {
            totalValue: availableCash + positions.reduce((acc, p) => acc + p.value, 0),
            availableCash,
            positions,
        };
    } catch (error) {
        log.error(error);
        throw error;
    }
} 