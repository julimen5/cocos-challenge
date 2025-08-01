export interface RawPosition {
    q: number;           // Current quantity (positive for long, negative for short)
    qTotal: number;      // Total quantity purchased (always positive)
    sumTotal: number;    // Total amount spent on purchases
}

export interface Position {
    instrumentid: number;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    performance: number;
    side: 'long' | 'short';
    realPerformance: number;
}

export interface PortfolioSummary {
    totalValue: number;
    availableCash: number;
    positions: Position[];
}