import { z } from 'zod';

// Portfolio request/response schemas will be defined here
export const getPortfolioParamsSchema = z.object({
    userId: z.string(),
});

// TODO: Add more schemas as needed 