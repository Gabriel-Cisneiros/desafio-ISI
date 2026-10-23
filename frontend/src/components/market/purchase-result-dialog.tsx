'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { cn } from 'cn';
import { clubPath } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime, formatMoney } from '@/lib/format';
import type { Purchase } from './buy-player-dialog';

interface ResultRow {
  label: string;
  description?: string;
  value: ReactNode;
  strong?: boolean;
}

interface PurchaseResultDialogProps {
  purchase: Purchase | undefined;
  onClose: () => void;
}

export function PurchaseResultDialog({
  purchase,
  onClose,
}: PurchaseResultDialogProps) {
  return (
    <Dialog
      open={purchase !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-125">
        {purchase && (
          <PurchaseResultContent purchase={purchase} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PurchaseResultContent({
  purchase: { result, player, club },
  onClose,
}: {
  purchase: Purchase;
  onClose: () => void;
}) {
  const rows: ResultRow[] = [
    {
      label: 'Valor',
      description: 'Valor de mercado no momento da compra',
      value: formatMoney(result.value),
    },
    ...(result.fee > 0
      ? [
          {
            label: 'Taxa',
            description: `5% do valor, porque passa de ${formatMoney(30)}`,
            value: formatMoney(result.fee),
          },
        ]
      : []),
    {
      label: 'Custo total',
      description: 'Valor + taxa',
      value: formatMoney(result.value + result.fee),
      strong: true,
    },
    {
      label: 'Fim da fidelidade',
      value: formatDateTime(result.contract.loyalty_until),
    },
    {
      label: 'Contrato',
      value: (
        <Badge variant="success">
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {result.contract.status}
        </Badge>
      ),
    },
    {
      label: `Novo caixa do ${club.name}`,
      value: formatMoney(result.club_cash),
      strong: true,
    },
  ];

  return (
    <>
      <DialogHeader className="gap-4">
        <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-5" />
        </span>
        <div className="flex flex-col gap-2">
          <DialogTitle>Compra concluída</DialogTitle>
          <DialogDescription>
            {player.name} agora é do {club.name}.
          </DialogDescription>
        </div>
      </DialogHeader>
      <dl className="divide-y overflow-hidden rounded-lg border">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              'flex items-center justify-between gap-4 px-4 py-3',
              row.strong && 'bg-muted-subtle',
            )}
          >
            <dt className="flex flex-col gap-0.5">
              <span
                className={cn(
                  row.strong ? 'font-semibold' : 'text-muted-foreground',
                )}
              >
                {row.label}
              </span>
              {row.description && (
                <span className="text-xs text-muted-foreground">
                  {row.description}
                </span>
              )}
            </dt>
            <dd
              className={cn(
                'font-medium',
                row.strong && 'text-base font-semibold',
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <DialogFooter>
        <Button variant="outline" asChild>
          <Link href={clubPath(club.id)} onClick={onClose}>
            Ver clube
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </>
  );
}
