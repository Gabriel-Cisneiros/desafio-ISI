'use client';

import Link from 'next/link';
import { History } from 'lucide-react';
import { cn } from 'cn';
import { clubPath } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { formatMoney, formatSignedMoney } from '@/lib/format';
import { type ResultRow, ResultRows, SuccessHeader } from './result-rows';
import type { Sale } from './sell-player-dialog';

interface SaleResultDialogProps {
  sale: Sale | undefined;
  onClose: () => void;
}

export function SaleResultDialog({ sale, onClose }: SaleResultDialogProps) {
  return (
    <Dialog
      open={sale !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-125">
        {sale && <SaleResultContent sale={sale} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function describeSale({ result, player, wasStarter }: Sale): string {
  if (wasStarter) {
    return `${player.name} voltou a ficar livre e saiu da escalação.`;
  }
  if (result.penalty === 0 && result.remaining_days === 0) {
    return `${player.name} voltou a ficar livre. A fidelidade já tinha terminado, então não houve multa.`;
  }
  return `${player.name} voltou a ficar livre.`;
}

function SaleResultContent({
  sale,
  onClose,
}: {
  sale: Sale;
  onClose: () => void;
}) {
  const { result, club } = sale;
  const profit = result.profit ?? 0;
  const rows: ResultRow[] = [
    {
      label: 'Valor de compra',
      value: formatMoney(result.purchase_value),
    },
    {
      label: 'Valor de venda',
      description: 'Valor de mercado no momento da venda',
      value: formatMoney(result.value),
    },
    {
      label: 'Dias restantes',
      value: result.remaining_days.toLocaleString('pt-BR'),
    },
    {
      label: 'Multa',
      description:
        result.penalty > 0
          ? `${result.penalty_rate}% do valor de venda, com teto de ${formatMoney(10)}`
          : 'Fidelidade cumprida: sem multa',
      value: formatMoney(result.penalty),
    },
    {
      label: 'Lucro',
      value: (
        <span
          className={cn(
            profit > 0 && 'text-success',
            profit < 0 && 'text-destructive',
          )}
        >
          {formatSignedMoney(profit)}
        </span>
      ),
    },
    {
      label: 'Comissão',
      description:
        result.fee > 0
          ? `10% do lucro até ${formatMoney(10)} + 20% do que passar`
          : 'Sem lucro: sem comissão',
      value: formatMoney(result.fee),
    },
    {
      label: 'Crédito no caixa',
      description: 'Valor de venda − multa − comissão',
      value: formatSignedMoney(result.cash_change),
      strong: true,
    },
    {
      label: 'Contrato',
      value: (
        <Badge
          variant={
            result.contract_status === 'RESCINDIDO' ? 'warning' : 'secondary'
          }
        >
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {result.contract_status}
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
      <SuccessHeader title="Venda concluída" description={describeSale(sale)} />
      <ResultRows rows={rows} />
      <DialogFooter>
        <Button variant="outline" asChild>
          <Link href={`${clubPath(club.id)}?aba=historico`} onClick={onClose}>
            <History data-icon="inline-start" />
            Ver histórico
          </Link>
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </>
  );
}
