'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { clubPath } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { formatDateTime, formatMoney } from '@/lib/format';
import type { Purchase } from './buy-player-dialog';
import { type ResultRow, ResultRows, SuccessHeader } from './result-rows';

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
      <SuccessHeader
        title="Compra concluída"
        description={`${player.name} agora é do ${club.name}.`}
      />
      <ResultRows rows={rows} />
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
