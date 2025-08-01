import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { buildPaginationParams } from '@/modules/shared/pagination/pagination';
import { SearchInstrumentParams } from '../instruments.dto';

export async function searchInstruments(
    params: SearchInstrumentParams
) {

    const paginationParams = buildPaginationParams(params.pageSize, params.page);
    // @todo: improve this query with different search methods
    const whereCondition: Prisma.InstrumentWhereInput = params.query ? {
        OR: [
            { ticker: { contains: params.query, mode: 'insensitive' } },
            { name: { contains: params.query, mode: 'insensitive' } },
        ],
    } : {};

    const [count, instruments] = await Promise.all([
        prisma.instrument.count({
            where: whereCondition,
        }),
        prisma.instrument.findMany({
            where: whereCondition,
            ...paginationParams,
        }),
    ]);
    return {
        instruments,
        total: count,
    };
} 