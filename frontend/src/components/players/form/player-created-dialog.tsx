'use client';

import { CircleCheck, Eye } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Player } from '@/lib/api/types/player';
import { formatMoney } from '@/lib/format';
import { POSITION_LABELS } from '@/lib/labels';

interface PlayerCreatedDialogProps {
  player: Player | undefined;
  onClose: () => void;
  onDetails: (player: Player) => void;
}

export function PlayerCreatedDialog({
  player,
  onClose,
  onDetails,
}: PlayerCreatedDialogProps) {
  return (
    <Dialog
      open={player !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-135">
        {player && (
          <>
            <DialogHeader className="gap-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success">
                <CircleCheck className="size-5" />
              </span>
              <div className="flex flex-col gap-2">
                <DialogTitle>Jogador cadastrado</DialogTitle>
                <DialogDescription>
                  {player.name} entrou livre e Apto. Valores em moedas,
                  calculados pela API ao salvar.
                </DialogDescription>
              </div>
            </DialogHeader>
            <dl className="divide-y rounded-lg border">
              {[
                {
                  label: 'Valor base',
                  description: 'Calculado no cadastro; não muda depois',
                  value: formatMoney(player.base_value),
                  highlight: true,
                },
                {
                  label: 'Valor de mercado',
                  description: 'Com condição, agilidade e idade',
                  value: formatMoney(player.market_value),
                },
                {
                  label: 'Overall',
                  description: `Pelos pesos da posição ${POSITION_LABELS[player.position]}`,
                  value: player.overall,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={cn(
                    'flex items-center justify-between gap-4 px-4 py-3',
                    row.highlight && 'rounded-t-lg bg-muted-subtle',
                  )}
                >
                  <dt className="flex flex-col gap-0.5">
                    <span className={cn(row.highlight && 'font-semibold')}>
                      {row.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {row.description}
                    </span>
                  </dt>
                  <dd
                    className={cn(
                      'font-medium',
                      row.highlight && 'text-lg font-semibold',
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <DialogFooter>
              <Button variant="outline" onClick={() => onDetails(player)}>
                <Eye data-icon="inline-start" />
                Ver detalhes
              </Button>
              <Button onClick={onClose}>Fechar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
