'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { HandCoins, Shirt, Users } from 'lucide-react';
import { ConditionBadge } from '@/components/shared/condition-badge';
import {
  DataTable,
  type DataTableColumn,
  WrapHeader,
} from '@/components/shared/data-table';
import { StateMessage } from '@/components/shared/list-state';
import { PenaltyBadge } from '@/components/shared/penalty-badge';
import { PlayerAvatar } from '@/components/shared/player-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SquadPlayer } from '@/lib/api/types/club';
import { formatMoney, splitDateTime } from '@/lib/format';

export const FREE_PLAYERS_PATH = '/jogadores?tab=free';

function contractCell(
  player: SquadPlayer,
  render: (contract: NonNullable<SquadPlayer['contract']>) => ReactNode,
) {
  return player.contract ? render(player.contract) : '–';
}

interface SquadTableProps {
  players: SquadPlayer[] | undefined;
  loading: boolean;
  error: string | undefined;
  onRetry: () => void;
  onSell: (player: SquadPlayer) => void;
}

export function SquadTable({
  players,
  loading,
  error,
  onRetry,
  onSell,
}: SquadTableProps) {
  const columns: DataTableColumn<SquadPlayer>[] = [
    {
      key: 'player',
      header: 'Jogador',
      cell: (player) => (
        <span className="flex items-center gap-3">
          <PlayerAvatar id={player.id} name={player.name} />
          <span className="font-medium">{player.name}</span>
        </span>
      ),
    },
    {
      key: 'position',
      header: 'Posição',
      cell: (player) => <Badge variant="outline">{player.position}</Badge>,
    },
    {
      key: 'overall',
      header: 'Overall',
      align: 'right',
      cell: (player) => <span className="font-semibold">{player.overall}</span>,
    },
    {
      key: 'condition',
      header: 'Condição',
      cell: (player) => <ConditionBadge condition={player.condition} />,
    },
    {
      key: 'market',
      header: <WrapHeader>Valor de mercado</WrapHeader>,
      align: 'right',
      cell: (player) => (
        <span className="font-semibold">
          {formatMoney(player.market_value)}
        </span>
      ),
    },
    {
      key: 'purchase',
      header: <WrapHeader>Valor de compra</WrapHeader>,
      align: 'right',
      cell: (player) =>
        contractCell(player, (contract) => (
          <span className="text-muted-foreground">
            {formatMoney(contract.purchase_value)}
          </span>
        )),
    },
    {
      key: 'loyalty',
      header: <WrapHeader>Fim da fidelidade</WrapHeader>,
      cell: (player) =>
        contractCell(player, (contract) => {
          const { date, time } = splitDateTime(contract.loyalty_until);
          return (
            <span className="flex flex-col">
              <span>{date}</span>
              <span className="text-xs text-muted-foreground">{time}</span>
            </span>
          );
        }),
    },
    {
      key: 'remaining',
      header: <WrapHeader>Dias restantes</WrapHeader>,
      align: 'right',
      cell: (player) =>
        contractCell(player, (contract) =>
          contract.remaining_days.toLocaleString('pt-BR'),
        ),
    },
    {
      key: 'penalty',
      header: <WrapHeader>% de multa</WrapHeader>,
      cell: (player) =>
        contractCell(player, (contract) => (
          <PenaltyBadge rate={contract.penalty_rate} />
        )),
    },
    {
      key: 'sell',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      cell: (player) => (
        <Button variant="outline" size="sm" onClick={() => onSell(player)}>
          <HandCoins data-icon="inline-start" />
          Vender
          <span className="sr-only">{player.name}</span>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={players}
      getRowKey={(player) => player.id}
      loading={loading}
      loadingLabel="Carregando elenco…"
      error={error}
      errorTitle="Não foi possível carregar o elenco"
      onRetry={onRetry}
      skeletonRows={6}
      empty={
        <StateMessage
          icon={Shirt}
          title="Nenhum jogador no elenco"
          description="Compre jogadores livres para montar o elenco. O limite é de 12 jogadores, e o custo de cada compra não pode passar de 50% do caixa."
          action={
            <Button variant="outline" asChild>
              <Link href={FREE_PLAYERS_PATH}>
                <Users data-icon="inline-start" />
                Ver jogadores livres
              </Link>
            </Button>
          }
        />
      }
      toolbar={
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold">Elenco</h2>
          <p className="text-xs text-muted-foreground">
            Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome.
            Contrato calculado para uma venda agora.
          </p>
        </div>
      }
    />
  );
}
