import { z } from 'zod';

// Instrument request/response schemas will be defined here
export const searchInstrumentsQuerySchema = z.object({
    q: z.string().min(1),
    limit: z.number().optional().default(20),
});

// TODO: Add more schemas as needed 