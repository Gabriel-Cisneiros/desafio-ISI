import { paginate } from './pagination';

describe('paginate', () => {
  const items = Array.from({ length: 23 }, (_, index) => index + 1);

  it.each([
    [10, 1, [1, 10], 3],
    [10, 3, [21, 23], 3],
    [50, 1, [1, 23], 1],
  ])(
    'limit %i, página %i: itens %j de %i páginas',
    (limit, page, [first, last], totalPages) => {
      const { data, meta } = paginate(items, page, limit);

      expect(data[0]).toBe(first);
      expect(data.at(-1)).toBe(last);
      expect(meta).toEqual({
        page,
        limit,
        total_items: 23,
        total_pages: totalPages,
      });
    },
  );

  it('devolve data vazio para página além da última', () => {
    expect(paginate(items, 4, 10)).toEqual({
      data: [],
      meta: { page: 4, limit: 10, total_items: 23, total_pages: 3 },
    });
  });

  it('devolve zero páginas quando não há itens', () => {
    expect(paginate([], 1, 10).meta).toEqual({
      page: 1,
      limit: 10,
      total_items: 0,
      total_pages: 0,
    });
  });
});
