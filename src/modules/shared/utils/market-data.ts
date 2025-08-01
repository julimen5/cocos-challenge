// Market data utility functions

export function calculateDailyChange(
    currentPrice: number,
    previousClose: number
): { change: number; changePercentage: number } {
    const change = currentPrice - previousClose;
    const changePercentage = previousClose > 0
        ? (change / previousClose) * 100
        : 0;

    return {
        change: Math.round(change * 100) / 100,
        changePercentage: Math.round(changePercentage * 100) / 100,
    };
}

export function getLatestMarketData(marketDataArray: any[]): any | null {
    if (!marketDataArray || marketDataArray.length === 0) return null;

    return marketDataArray.reduce((latest, current) => {
        return new Date(current.datetime) > new Date(latest.datetime) ? current : latest;
    });
}

export function validatePrice(price: number): boolean {
    return price > 0 && Number.isFinite(price);
}

export function formatCurrency(amount: number, currency: string = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency,
    }).format(amount);
} 