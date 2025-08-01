import { prisma } from "@/lib/prisma";

export const getCashInstrument = async (ticker: string) => {
    const cashInstrument = await prisma.instrument.findFirst({
        where: {
            type: 'MONEDA',
            ticker: ticker
        }
    })
    return cashInstrument;
}