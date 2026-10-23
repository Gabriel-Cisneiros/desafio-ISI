'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BadgePercent,
  Check,
  ChevronDown,
  CircleAlert,
  Download,
  HandCoins,
  History,
  LoaderCircle,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from 'cn';
import {
  DataTable,
  type DataTableColumn,
  WrapHeader,
} from '@/components/shared/data-table';
import { StateMessage } from '@/components/shared/list-state';
import { PlayerAvatar } from '@/components/shared/player-avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransactions } from '@/hooks/data/market';
import { useApiAction } from '@/hooks/use-api-action';
import { marketService } from '@/lib/api/services/market';
import { TRANSACTION_TYPES, type TransactionType } from '@/lib/api/types/enums';
import type {
  ListTransactionsQuery,
  Transaction,
  TransactionSummary,
} from '@/lib/api/types/market';
import { downloadFile } from '@/lib/download';
import { formatMoney, formatSignedMoney, splitDateTime } from '@/lib/format';
import { TRANSACTION_TYPE_LABELS } from '@/lib/labels';

const TYPE_PARAM = 'tipo';
const PLAYER_PARAM = 'jogador';
const ALL_PLAYERS = '';

const TYPE_ICONS: Record<TransactionType, LucideIcon> = {
  COMPRA: ShoppingCart,
  VENDA: HandCoins,
};

function readTypes(value: string | null): TransactionType[] {
  const types = TRANSACTION_TYPES.filter((type) =>
    value?.split(',').includes(type),
  );
  return types.length > 0 ? types : [...TRANSACTION_TYPES];
}

function readPlayer(value: string | null): number | undefined {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

function signedClass(value: number): string | undefined {
  if (value > 0) {
    return 'text-success';
  }
  return value < 0 ? 'text-destructive' : undefined;
}

const columns: DataTableColumn<Transaction>[] = [
  {
    key: 'date',
    header: 'Data e hora',
    cell: (transaction) => {
      const { date, time } = splitDateTime(transaction.created_at);
      return (
        <span>
          {date} <span className="ml-1 text-muted-foreground">{time}</span>
        </span>
      );
    },
  },
  {
    key: 'type',
    header: 'Tipo',
    cell: (transaction) => {
      const Icon = TYPE_ICONS[transaction.type];
      return (
        <Badge
          variant={transaction.type === 'COMPRA' ? 'outline' : 'secondary'}
        >
          <Icon />
          {TRANSACTION_TYPE_LABELS[transaction.type]}
        </Badge>
      );
    },
  },
  {
    key: 'player',
    header: 'Jogador',
    cell: (transaction) => (
      <span className="flex items-center gap-3">
        <PlayerAvatar
          id={transaction.player_id}
          name={transaction.player_name}
        />
        <span className="font-medium">{transaction.player_name}</span>
      </span>
    ),
  },
  {
    key: 'value',
    header: 'Valor',
    align: 'right',
    cell: (transaction) => formatMoney(transaction.value),
  },
  {
    key: 'fee',
    header: <WrapHeader>Taxa ou comissão</WrapHeader>,
    align: 'right',
    cell: (transaction) => formatMoney(transaction.fee),
  },
  {
    key: 'penalty',
    header: 'Multa',
    align: 'right',
    cell: (transaction) => (
      <span className="text-muted-foreground">
        {formatMoney(transaction.penalty)}
      </span>
    ),
  },
  {
    key: 'profit',
    header: 'Lucro',
    align: 'right',
    cell: (transaction) =>
      transaction.profit === null ? (
        <span className="text-muted-foreground">–</span>
      ) : (
        <span className={signedClass(transaction.profit)}>
          {formatSignedMoney(transaction.profit)}
        </span>
      ),
  },
  {
    key: 'cash',
    header: <WrapHeader>Variação do caixa</WrapHeader>,
    align: 'right',
    cell: (transaction) => (
      <span
        className={cn('font-semibold', signedClass(transaction.cash_change))}
      >
        {formatSignedMoney(transaction.cash_change)}
      </span>
    ),
  },
];

interface HistoryPlayer {
  id: number;
  name: string;
}

interface HistoryTabProps {
  clubId: number;
  players: HistoryPlayer[];
}

export function HistoryTab({ clubId, players }: HistoryTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const types = readTypes(searchParams.get(TYPE_PARAM));
  const playerId = readPlayer(searchParams.get(PLAYER_PARAM));
  const filtered = types.length < TRANSACTION_TYPES.length || playerId;
  const query: ListTransactionsQuery = {
    type: types.length < TRANSACTION_TYPES.length ? types : undefined,
    player_id: playerId,
  };
  const history = useTransactions(clubId, query);
  const refused =
    history.errorStatus !== undefined && history.errorStatus < 500;
  const selectedPlayer = players.find(({ id }) => id === playerId);
  const fileName = `historico-clube-${clubId}.csv`;
  const filterParts = [
    query.type &&
      `tipo ${query.type.map((type) => TRANSACTION_TYPE_LABELS[type]).join(' e ')}`,
    playerId !== undefined && `jogador ${selectedPlayer?.name ?? playerId}`,
  ].filter(Boolean);
  const exportCsv = useApiAction(
    async () => {
      downloadFile(await marketService.exportCsv(clubId, query), fileName);
    },
    {
      errorTitle: 'Não foi possível exportar o CSV',
      success: {
        title: 'CSV baixado',
        description:
          filterParts.length > 0
            ? `${fileName}, com o filtro de ${filterParts.join(' e ')} aplicado.`
            : `${fileName}, sem filtros.`,
      },
    },
  );

  function updateParams(change: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    change(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function toggleType(type: TransactionType) {
    const next = types.includes(type)
      ? types.filter((item) => item !== type)
      : [...types, type];
    updateParams((params) =>
      next.length === TRANSACTION_TYPES.length
        ? params.delete(TYPE_PARAM)
        : params.set(TYPE_PARAM, next.join(',')),
    );
  }

  function clearFilters() {
    updateParams((params) => {
      params.delete(TYPE_PARAM);
      params.delete(PLAYER_PARAM);
    });
  }

  const toolbar = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold">Histórico de transações</h2>
          <p className="text-xs text-muted-foreground">
            Da mais recente para a mais antiga, com o nome e os valores do
            momento de cada operação.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={exportCsv.pending}
          onClick={() => void exportCsv.run()}
        >
          {exportCsv.pending ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Download data-icon="inline-start" />
          )}
          Exportar CSV
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted-foreground">Tipo</span>
        {TRANSACTION_TYPES.map((type) => {
          const checked = types.includes(type);
          return (
            <Button
              key={type}
              variant="outline"
              role="checkbox"
              aria-checked={checked}
              disabled={checked && types.length === 1}
              onClick={() => toggleType(type)}
              className={cn(
                'font-normal disabled:opacity-100',
                checked &&
                  'border-primary bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft hover:text-primary-soft-foreground',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex size-4 items-center justify-center rounded-sm border border-input bg-background',
                  checked &&
                    'border-primary bg-primary text-primary-foreground',
                )}
              >
                {checked && <Check className="size-3" />}
              </span>
              {TRANSACTION_TYPE_LABELS[type]}
            </Button>
          );
        })}
        <span aria-hidden className="mx-1 h-6 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="font-normal">
              <User
                data-icon="inline-start"
                className="text-muted-foreground"
              />
              Jogador: {selectedPlayer?.name ?? 'todos'}
              <ChevronDown
                data-icon="inline-end"
                className="text-muted-foreground"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto min-w-48">
            <DropdownMenuRadioGroup
              value={playerId === undefined ? ALL_PLAYERS : String(playerId)}
              onValueChange={(value) =>
                updateParams((params) =>
                  value === ALL_PLAYERS
                    ? params.delete(PLAYER_PARAM)
                    : params.set(PLAYER_PARAM, value),
                )
              }
            >
              <DropdownMenuRadioItem value={ALL_PLAYERS}>
                Todos os jogadores
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              {players.map((player) => (
                <DropdownMenuRadioItem
                  key={player.id}
                  value={String(player.id)}
                >
                  {player.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {filtered && (
          <Button variant="link" className="h-auto px-1" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );

  if (refused) {
    return (
      <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-4 py-3">{toolbar}</div>
        <div className="p-4">
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>O filtro foi recusado</AlertTitle>
            <AlertDescription>{history.error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={history.data?.data}
      getRowKey={(transaction) => transaction.id}
      loading={history.loading}
      loadingLabel="Carregando histórico…"
      error={history.error}
      errorTitle="Não foi possível carregar o histórico"
      onRetry={history.reload}
      skeletonRows={6}
      toolbar={toolbar}
      emptyInline
      empty={
        <StateMessage
          icon={History}
          title={
            filtered
              ? 'Nenhuma transação com esses filtros'
              : 'Nenhuma transação ainda'
          }
          description={
            filtered
              ? 'Tire alguns filtros para ver mais transações.'
              : 'As compras e vendas do clube aparecem aqui, com os totais logo abaixo.'
          }
          className="rounded-none border-0"
        />
      }
      footer={history.data && <SummaryCards summary={history.data.summary} />}
      footerClassName="p-0"
    />
  );
}

function SummaryCards({ summary }: { summary: TransactionSummary }) {
  const cards: {
    label: string;
    icon: LucideIcon;
    value: string;
    description: string;
    className?: string;
  }[] = [
    {
      label: 'Total pago em compras',
      icon: ShoppingCart,
      value: formatMoney(summary.total_spent),
      description: 'Valor + taxa',
    },
    {
      label: 'Total recebido em vendas',
      icon: HandCoins,
      value: formatMoney(summary.total_received),
      description: 'Crédito líquido',
    },
    {
      label: 'Taxas e comissões',
      icon: BadgePercent,
      value: formatMoney(summary.total_fees),
      description: 'Somadas',
    },
    {
      label: 'Multas',
      icon: TriangleAlert,
      value: formatMoney(summary.total_penalties),
      description: 'Por fidelidade',
    },
    {
      label: 'Lucro total',
      icon: summary.total_profit < 0 ? TrendingDown : TrendingUp,
      value: formatSignedMoney(summary.total_profit),
      description: 'Soma dos lucros, com sinal',
      className: signedClass(summary.total_profit),
    },
  ];

  return (
    <dl className="grid grid-cols-5 divide-x bg-muted-subtle">
      {cards.map(({ label, icon: Icon, value, description, className }) => (
        <div key={label} className="flex flex-col gap-1 px-4 py-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5" />
            {label}
          </dt>
          <dd className={cn('text-lg font-semibold', className)}>{value}</dd>
          <dd className="text-xs text-muted-foreground">{description}</dd>
        </div>
      ))}
    </dl>
  );
}
