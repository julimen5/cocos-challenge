import z, { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function makeSuccessResponseSchema(zodSchema: ZodSchema<any>, pagination?: boolean) {
    return {
        type: "object",
        properties: {
            msg: { type: "string" },
            result: zodToJsonSchema(zodSchema, { target: "openApi3" }),
            ...(pagination && {
                metadata: zodToJsonSchema(z.object({
                    totalCount: z.number(),
                    numberOfPages: z.number(),
                    pageSize: z.number(),
                    currentPage: z.number(),
                    nextPage: z.number(),
                }), { target: "openApi3" }),
            }),
        },
    };
}

export function makeErrorResponseSchema() {
    return {
        type: "object",
        properties: {
            result: {
                type: "object",
                properties: {
                    msg: { type: "string" },
                },
            },
        },
    };
}

export function makeRouteSchema({
    summary,
    tags,
    body,
    params,
    querystring,
    response,
    pagination,
}: {
    summary?: string;
    tags?: string[];
    body?: ZodSchema<any>;
    params?: ZodSchema<any>;
    querystring?: ZodSchema<any>;
    response: ZodSchema<any>;
    pagination?: boolean;
}) {
    return {
        ...(summary && { summary }),
        ...(tags && { tags }),
        ...(body && { body: zodToJsonSchema(body, { target: "openApi3" }) }),
        ...(params && { params: zodToJsonSchema(params, { target: "openApi3" }) }),
        ...(querystring && {
            querystring: zodToJsonSchema(querystring, { target: "openApi3" }),
        }),
        response: {
            200: makeSuccessResponseSchema(response, pagination),
        },
    };
}
