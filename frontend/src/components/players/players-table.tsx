'use client';

import type { ReactNode } from 'react';
import { ConditionBadge } from '@/components/shared/condition-badge';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { PlayerAvatar } from '@/components/shared/player-avatar';
import { Badge } from '@/components/ui/badge';
import type { Club } from '@/lib/api/types/club';
import type { Player } from '@/lib/api/types/player';
import { formatMoney } from '@/lib/format';
import { POSITION_LABELS } from '@/lib/labels';
import { AgilityBar, ClubCell } from './player-cells';
import {
  BuyButton,
  type PlayerActionHandlers,
  PlayerActions,
} from './player-actions';

interface PlayersTableProps extends PlayerActionHandlers {
  players: Player[] | undefined;
  clubs: Map<number, Club>;
  loading: boolean;
  error: string | undefined;
  onRetry: () => void;
  empty: ReactNode;
  toolbar: ReactNode;
  footer: ReactNode;
}

export function PlayersTable({
  players,
  clubs,
  loading,
  error,
  onRetry,
  empty,
  toolbar,
  footer,
  ...handlers
}: PlayersTableProps) {
  const columns: DataTableColumn<Player>[] = [
    {
      key: 'player',
      header: 'Jogador',
      cell: (player) => (
        <span className="flex items-center gap-3">
          <PlayerAvatar id={player.id} name={player.name} />
          <span className="flex flex-col">
            <span className="font-medium">{player.name}</span>
            <span className="text-xs text-muted-foreground">
              {POSITION_LABELS[player.position]}
            </span>
          </span>
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
      key: 'agility',
      header: 'Agilidade',
      cell: (player) => <AgilityBar agility={player.agility} />,
    },
    {
      key: 'age',
      header: 'Idade',
      align: 'right',
      cell: (player) => player.age,
    },
    {
      key: 'condition',
      header: 'Condição',
      cell: (player) => <ConditionBadge condition={player.condition} />,
    },
    {
      key: 'base',
      header: 'Valor base',
      align: 'right',
      cell: (player) => (
        <span className="text-muted-foreground">
          {formatMoney(player.base_value)}
        </span>
      ),
    },
    {
      key: 'market',
      header: 'Valor de mercado',
      align: 'right',
      cell: (player) => (
        <span className="font-semibold">
          {formatMoney(player.market_value)}
        </span>
      ),
    },
    {
      key: 'club',
      header: 'Clube',
      cell: (player) =>
        player.club_id === null ? (
          <span className="flex items-center gap-2">
            <ClubCell club={undefined} />
            <BuyButton player={player} onBuy={handlers.onBuy} />
          </span>
        ) : (
          <ClubCell club={clubs.get(player.club_id)} />
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      cell: (player) => <PlayerActions player={player} {...handlers} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={players}
      getRowKey={(player) => player.id}
      loading={loading}
      loadingLabel="Carregando jogadores…"
      error={error}
      errorTitle="Não foi possível carregar os jogadores"
      onRetry={onRetry}
      empty={empty}
      toolbar={toolbar}
      footer={footer}
    />
  );
}
