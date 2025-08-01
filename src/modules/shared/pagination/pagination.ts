export const buildPaginationParams = (pageSize: number, page: number) => {
    const skip = (page - 1) * pageSize;
    return {
        skip,
        take: pageSize,
    };
};