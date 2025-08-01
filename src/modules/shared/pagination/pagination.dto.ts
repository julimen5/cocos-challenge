import { z } from "zod";

export const PaginationParamsSchema = z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
});

export type PaginationParamsDTO = z.infer<typeof PaginationParamsSchema>;