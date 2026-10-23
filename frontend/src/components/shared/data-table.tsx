import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from 'cn';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ErrorState } from './list-state';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string | number;
  loading: boolean;
  loadingLabel: string;
  error: string | undefined;
  errorTitle: string;
  onRetry: () => void;
  empty: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  emptyInline?: boolean;
  skeletonRows?: number;
}

export function WrapHeader({ children }: { children: ReactNode }) {
  return <span className="whitespace-normal">{children}</span>;
}

const ALIGN = { left: 'text-left', right: 'text-right' } as const;

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  loadingLabel,
  error,
  errorTitle,
  onRetry,
  empty,
  toolbar,
  footer,
  footerClassName,
  emptyInline = false,
  skeletonRows = 10,
}: DataTableProps<T>) {
  if (error) {
    return <ErrorState title={errorTitle} message={error} onRetry={onRetry} />;
  }

  const showSkeleton = loading && rows === undefined;
  const isEmpty = !showSkeleton && rows?.length === 0;
  if (isEmpty && !emptyInline) {
    return empty;
  }
  const footerBlock = footer && !showSkeleton && (
    <div className={cn('border-t px-4 py-3', footerClassName)}>{footer}</div>
  );

  if (isEmpty) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card">
        {toolbar && <div className="border-b px-4 py-3">{toolbar}</div>}
        {empty}
        {footerBlock}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {showSkeleton ? (
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {loadingLabel}
          </p>
          <Skeleton className="h-9 w-56" />
        </div>
      ) : (
        toolbar && <div className="border-b px-4 py-3">{toolbar}</div>
      )}
      <Table
        aria-busy={loading}
        className={cn(loading && !showSkeleton && 'opacity-60')}
      >
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(ALIGN[column.align ?? 'left'], column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton
            ? Array.from({ length: skeletonRows }, (_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        ALIGN[column.align ?? 'left'],
                        column.className,
                      )}
                    >
                      <Skeleton
                        className={cn(
                          'h-4 w-16',
                          column.align === 'right' && 'ml-auto',
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows?.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        ALIGN[column.align ?? 'left'],
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {footerBlock}
    </div>
  );
}
