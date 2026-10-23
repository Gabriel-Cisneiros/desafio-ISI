'use client';

import { useState } from 'react';
import {
  CircleAlert,
  HandCoins,
  Info,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import { PenaltyBadge } from '@/components/shared/penalty-badge';
import { PlayerSummary } from '@/components/shared/player-summary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiAction } from '@/hooks/use-api-action';
import { useApiQuery } from '@/hooks/use-api-query';
import { isOfflineError } from '@/lib/api/errors';
import { lineupsService } from '@/lib/api/services/lineups';
import { marketService } from '@/lib/api/services/market';
import type { Club, SquadPlayer } from '@/lib/api/types/club';
import type { SaleResult } from '@/lib/api/types/market';
import { formatDateTime, formatMoney } from '@/lib/format';
import { ResultRows } from './result-rows';

interface SellError {
  offline: boolean;
  message: string;
}

export interface Sale {
  result: SaleResult;
  player: SquadPlayer;
  club: Club;
  wasStarter: boolean;
}

interface SellPlayerDialogProps {
  player: SquadPlayer | undefined;
  club: Club;
  onClose: () => void;
  onSold: (sale: Sale) => void;
}

export function SellPlayerDialog({
  player,
  club,
  onClose,
  onSold,
}: SellPlayerDialogProps) {
  return (
    player && (
      <SellContent
        key={player.id}
        player={player}
        club={club}
        onClose={onClose}
        onSold={onSold}
      />
    )
  );
}

function SellContent({
  player,
  club,
  onClose,
  onSold,
}: SellPlayerDialogProps & { player: SquadPlayer }) {
  const [error, setError] = useState<SellError>();
  const lineup = useApiQuery(['lineup', club.id], () =>
    lineupsService.get(club.id),
  );
  const starter =
    lineup.data?.players.some((item) => item.id === player.id) ?? false;
  const sell = useApiAction(() => marketService.sell(player.id), {
    errorTitle: 'A venda foi recusada',
    onError: (message, cause) =>
      setError({ offline: isOfflineError(cause), message }),
    onSuccess: (result) =>
      onSold({ result, player, club, wasStarter: starter }),
  });
  const SubmitIcon = sell.pending
    ? LoaderCircle
    : error?.offline
      ? RefreshCw
      : HandCoins;

  return (
    <Dialog open onOpenChange={(open) => !open && !sell.pending && onClose()}>
      <DialogContent showCloseButton={!sell.pending} className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Vender {player.name}?</DialogTitle>
          <DialogDescription>
            O jogador sai do elenco do {club.name} e volta a ficar livre.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>
              {error.offline ? 'Sem conexão' : 'A venda foi recusada'}
            </AlertTitle>
            <AlertDescription>
              {error.offline
                ? 'A venda não foi confirmada. Verifique a conexão e tente de novo.'
                : error.message}
            </AlertDescription>
          </Alert>
        ) : (
          starter && (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>{player.name} é titular</AlertTitle>
              <AlertDescription>
                Ao vender, ele sai da escalação, e o {club.name} só volta a
                jogar partidas depois de escalar de novo os 5 titulares.
              </AlertDescription>
            </Alert>
          )
        )}

        <PlayerSummary
          player={player}
          aside={
            <span className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-muted-foreground">
                Valor de mercado
              </span>
              <span className="text-lg font-semibold">
                {formatMoney(player.market_value)}
              </span>
            </span>
          }
        />

        {player.contract && (
          <ResultRows
            rows={[
              {
                label: 'Valor de compra',
                value: formatMoney(player.contract.purchase_value),
              },
              {
                label: 'Fim da fidelidade',
                value: formatDateTime(player.contract.loyalty_until),
              },
              {
                label: 'Dias restantes',
                value: player.contract.remaining_days.toLocaleString('pt-BR'),
              },
              {
                label: '% de multa se vender agora',
                value: <PenaltyBadge rate={player.contract.penalty_rate} />,
              },
            ]}
          />
        )}

        <p className="flex items-start gap-2 rounded-lg border bg-muted-subtle px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" />A venda é pelo valor de
          mercado do momento. Multa (teto de {formatMoney(10)}), lucro, comissão
          e crédito são calculados ao confirmar.
        </p>
        {sell.pending && (
          <p className="flex items-center gap-2 rounded-lg border bg-muted-subtle px-3 py-2 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" />
            Enviando a venda. Os botões ficam desabilitados até a resposta.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" disabled={sell.pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={sell.pending}
            onClick={() => {
              setError(undefined);
              void sell.run();
            }}
          >
            <SubmitIcon
              data-icon="inline-start"
              className={sell.pending ? 'animate-spin' : undefined}
            />
            {sell.pending
              ? 'Vendendo…'
              : error?.offline
                ? 'Tentar de novo'
                : 'Confirmar venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
