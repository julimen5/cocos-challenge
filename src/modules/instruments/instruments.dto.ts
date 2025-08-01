import { z } from "zod";
import { PaginationParamsSchema } from "../shared/pagination/pagination.dto";

export const SearchInstrumentParamsSchema = z.object({
    query: z.string().optional(),
}).merge(PaginationParamsSchema);

export type SearchInstrumentParams = z.infer<typeof SearchInstrumentParamsSchema>;