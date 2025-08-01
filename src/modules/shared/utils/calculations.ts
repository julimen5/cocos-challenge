// Financial calculation utilities

export function calculatePercentageChange(
    currentValue: number,
    previousValue: number
): number {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
}

export function calculateReturn(
    currentPrice: number,
    averageCost: number,
    shares: number
): { totalReturn: number; totalReturnPercentage: number } {
    const currentValue = currentPrice * shares;
    const investedValue = averageCost * shares;
    const totalReturn = currentValue - investedValue;
    const totalReturnPercentage = calculatePercentageChange(currentValue, investedValue);

    return {
        totalReturn,
        totalReturnPercentage,
    };
}

export function calculateMaxShares(
    cashAmount: number,
    pricePerShare: number
): number {
    if (pricePerShare <= 0) return 0;
    return Math.floor(cashAmount / pricePerShare);
}

export function roundToDecimalPlaces(value: number, places: number = 2): number {
    return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
} 