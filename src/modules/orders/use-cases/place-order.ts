import { prisma } from '@/lib/prisma';
import { getCurrentMarketDataOrFail } from './get-current-price';
import { PlaceOrderData } from '../orders.schemas';
import { getAvailableCash } from '@/modules/portfolio/use-cases/get-available-cash';
import { MarketData, Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { aggregateUserPositions, fetchUserOrders } from '@/modules/portfolio/services/position.service';
import { getCashInstrument } from '@/modules/instruments/service/instruments.service';
import { logger } from '@/lib/logger';

export async function placeOrder(orderData: PlaceOrderData) {
    const log = logger.child({
        userId: orderData.userId,
        instrumentId: orderData.instrumentId,
        side: orderData.side,
        type: orderData.type,
    });
    try {
        // forcing acciones for now. preventing to place an order for a non acciones instrument like "MONEDA".
        // I think funding orders should be handled in another way/endpoint to keep control over the cash
        // even if we update the cash instrument of the user
        const marketData = await getCurrentMarketDataOrFail(orderData.instrumentId, 'ACCIONES');
        if (!marketData.close && orderData.type === 'MARKET') {
            log.error('No price found for instrument');

            return prisma.order.create({
                data: {
                    instrumentid: parseInt(orderData.instrumentId),
                    userid: parseInt(orderData.userId),
                    side: orderData.side,
                    type: orderData.type,
                    datetime: dayjs().toDate().toISOString(),
                    size: 0,
                    status: 'REJECTED',
                    reason: 'No price found for instrument',
                }
            })
        }
        if (orderData.side === 'BUY') {
            return placeBuyOrder(orderData, marketData);
        }

        if (orderData.side === 'SELL') {
            return placeSellOrder(orderData, marketData);
        }
    } catch (error) {
        console.log('==============')
        logger.error('Error placing order:', error);
        throw error;
    }
}

export const placeSellOrder = async (orderData: PlaceOrderData, marketData: MarketData) => {
    const log = logger.child({
        userId: orderData.userId,
        instrumentId: orderData.instrumentId,
        side: orderData.side,
        type: orderData.type,
    });
    try {
        const today = dayjs().toDate().toISOString();
        const order: Omit<Prisma.OrderUncheckedCreateInput, 'id'> = {
            instrumentid: parseInt(orderData.instrumentId),
            userid: parseInt(orderData.userId),
            side: 'SELL',
            type: orderData.type,
            status: orderData.type === 'MARKET' ? 'FILLED' : 'NEW',
            datetime: today,
            size: 0
        };
        log.info('Selling shares');
        const orders = await fetchUserOrders(orderData.userId, parseInt(orderData.instrumentId));
        const rawPositions = aggregateUserPositions(orders);
        const position = rawPositions[parseInt(orderData.instrumentId)];
        if (!position) {
            log.error('No position found for instrument');
            return prisma.order.create({
                data: {
                    ...order,
                    status: 'REJECTED',
                    reason: 'No position found for instrument',
                }
            })
        }
        const { executionPrice, size } = calculateOrderSizeAndPrice(orderData, Number(marketData.close));

        if (size <= 0) {
            log.error('Cash amount too low to sell any shares');
            return prisma.order.create({
                data: {
                    ...order,
                    status: 'REJECTED',
                    reason: 'Cash amount too low to sell any shares',
                    size,
                    price: executionPrice,
                }
            });
        }

        if (position.q < size) {
            log.error('Insufficient position');
            return prisma.order.create({
                data: {
                    ...order,
                    status: 'REJECTED',
                    reason: 'Insufficient position',
                    size,
                    price: executionPrice,
                }
            });
        }

        return prisma.$transaction(async (tx) => {
            log.info('Selling shares');
            const createdOrder = await tx.order.create({
                data: {
                    ...order,
                    status: orderData.type === 'MARKET' ? 'FILLED' : 'NEW',
                    size,
                    price: executionPrice,
                }
            });
            if (orderData.type === 'MARKET') {
                const cashInstrument = await getCashInstrument('ARS');
                if (!cashInstrument) {
                    // this should never happen validations should prevent this
                    throw new Error('Cash instrument not found');
                }
                await tx.order.create({
                    data: {
                        instrumentid: cashInstrument.id,
                        side: 'CASH_IN',
                        status: 'FILLED',
                        size: size * executionPrice,
                        price: 1,
                        userid: parseInt(orderData.userId),
                        datetime: today,
                    }
                })
            }
            return createdOrder;
        });
    } catch (error) {
        console.log('error', error);
        logger.error('Error placing order:', error);
        throw error;
    }
}



export const placeBuyOrder = async (orderData: PlaceOrderData, marketData: MarketData) => {
    const log = logger.child({
        userId: orderData.userId,
        instrumentId: orderData.instrumentId,
        side: orderData.side,
        type: orderData.type,
    });
    try {
        const today = dayjs().toDate().toISOString();
        log.info('Buying shares');
        const getCashAmount = await getAvailableCash(orderData.userId);
        const order: Omit<Prisma.OrderUncheckedCreateInput, 'id'> = {
            instrumentid: parseInt(orderData.instrumentId),
            userid: parseInt(orderData.userId),
            side: 'BUY',
            type: orderData.type,
            status: orderData.type === 'MARKET' ? 'FILLED' : 'NEW',
            datetime: today,
            size: 0
        }

        // we ensure with the schema that either one or the other is provided
        const { executionPrice, size } = calculateOrderSizeAndPrice(orderData, Number(marketData.close));
        const operationCost = executionPrice * size;

        if (operationCost > getCashAmount) {
            log.error('Insufficient funds');
            return prisma.order.create({
                data: {
                    ...order,
                    status: 'REJECTED',
                    reason: 'Insufficient funds',
                    size,
                    price: executionPrice,
                }
            })
        }

        if (size <= 0) {
            log.error('Cash amount too low to buy any shares');
            return prisma.order.create({
                data: {
                    ...order,
                    status: 'REJECTED',
                    reason: 'Cash amount too low to buy any shares',
                }
            })
        }

        return prisma.$transaction(async (tx) => {
            log.info('Buying sharsssssses');
            const createdOrder = await tx.order.create({
                data: {
                    ...order,
                    price: executionPrice,
                    size,
                }
            })
            if (orderData.type === 'MARKET') {
                const cashInstrument = await getCashInstrument('ARS');
                if (!cashInstrument) {
                    log.error('Cash instrument not found');
                    throw new Error('Cash instrument not found');
                }
                await tx.order.create({
                    data: {
                        instrumentid: cashInstrument.id,
                        side: 'CASH_OUT',
                        status: 'FILLED',
                        size: operationCost,
                        price: 1,
                        userid: parseInt(orderData.userId),
                        datetime: today,
                    }
                })
            }
            return createdOrder;
        })
    } catch (error) {
        console.log('error', error);
        logger.error('Error placing order:', error);
        throw error;
    }
}

export const calculateOrderSizeAndPrice = (orderData: PlaceOrderData, closePrice: number) => {
    const executionPrice = orderData.price || closePrice;
    const size = orderData.size ?? Math.floor((orderData.cashAmount || 0) / executionPrice);
    return { executionPrice, size };
}