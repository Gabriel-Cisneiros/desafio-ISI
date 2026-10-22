import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ELLIPSIS = 'ellipsis';

type PageItem = number | typeof ELLIPSIS;

export function getPageItems(page: number, totalPages: number): PageItem[] {
  const pages = new Set(
    [1, page - 1, page, page + 1, totalPages].filter(
      (value) => value >= 1 && value <= totalPages,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) {
      items.push(ELLIPSIS);
    }
    items.push(value);
  });
  return items;
}

interface PaginationProps {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  limit,
  totalItems,
  totalPages,
  itemLabel,
  onPageChange,
}: PaginationProps) {
  const first = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, totalItems);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {first}–{last} de {totalItems} {itemLabel}
      </p>
      {totalPages > 0 && (
        <nav aria-label="Paginação" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft data-icon="inline-start" />
            Anterior
          </Button>
          {getPageItems(page, totalPages).map((item, index) =>
            item === ELLIPSIS ? (
              <span
                key={`${ELLIPSIS}-${index}`}
                className="px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? 'outline' : 'ghost'}
                size="icon-sm"
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ),
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
            <ChevronRight data-icon="inline-end" />
          </Button>
        </nav>
      )}
    </div>
  );
}
