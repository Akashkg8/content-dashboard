export const PAGE_SIZE = 9;
export const MAX_PAGE = 20;

export function paginate<T>(items: readonly T[], page: number, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), hasMore: start + pageSize < items.length };
}
