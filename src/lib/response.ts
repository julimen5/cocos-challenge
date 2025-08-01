export interface Response<T, K = any> {
    msg: string;
    result: T;
    metadata?: K;
    success: boolean;
}

export const pagingResponse = (
    currentPage: number,
    count: number,
    pageSize: number,
) => {
    const numberOfPages = Math.ceil(count / pageSize);
    const nextPage = currentPage < numberOfPages ? currentPage + 1 : null;

    return {
        totalCount: count,
        numberOfPages: Math.ceil(count / pageSize),
        pageSize,
        currentPage,
        nextPage,
    };
};


export const createSuccessResponse = <T, K = any>(
    result: T,
    msg?: string,
    metadata?: K,
): Response<T, K> => ({
    msg: msg || "",
    result,
    ...(metadata !== undefined && { metadata }),
    success: true,
});
export const createErrorResponse = (message: string, code?: string) => ({
    success: false,
    result: {
        message,
        code,
        timestamp: new Date().toISOString(),
    },
}); 