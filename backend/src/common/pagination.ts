import { Paginated } from './interfaces/paginated.interface';

export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): Paginated<T> {
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      total_items: items.length,
      total_pages: Math.ceil(items.length / limit),
    },
  };
}
