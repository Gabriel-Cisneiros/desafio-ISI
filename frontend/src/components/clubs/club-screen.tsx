'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Coins,
  History,
  Landmark,
  SearchX,
  Shirt,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import {
  type Sale,
  SellPlayerDialog,
} from '@/components/market/sell-player-dialog';
import { SaleResultDialog } from '@/components/market/sale-result-dialog';
import { ErrorState, StateMessage } from '@/components/shared/list-state';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClub } from '@/hooks/data/clubs';
import { useTransactions } from '@/hooks/data/market';
import type { ClubDetails, SquadPlayer } from '@/lib/api/types/club';
import { formatMoney } from '@/lib/format';
import { type ClubTab, ClubTabs } from './club-tabs';
import { HistoryTab } from './history-tab';
import { LineupTab } from './lineup/lineup-tab';
import { FREE_PLAYERS_PATH, SquadTable } from './squad-table';

const MAX_SQUAD = 12;
const SECTION_PARAM = 'aba';

type ClubSection = 'elenco' | 'escalacao' | 'historico';

const SECTIONS: ClubSection[] = ['elenco', 'escalacao', 'historico'];

function readSection(value: string | null): ClubSection {
  return SECTIONS.find((section) => section === value) ?? 'elenco';
}

export function ClubScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = readSection(searchParams.get(SECTION_PARAM));
  const club = useClub(Number(id));
  const [selling, setSelling] = useState<SquadPlayer>();
  const allTransactions = useTransactions(Number(id), {});
  const historyPlayers = useMemo(() => {
    const players = new Map<number, string>();
    for (const transaction of allTransactions.data?.data ?? []) {
      players.set(transaction.player_id, transaction.player_name);
    }
    return [...players]
      .map(([playerId, name]) => ({ id: playerId, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [allTransactions.data]);
  const [sale, setSale] = useState<Sale>();

  function changeSection(next: ClubSection) {
    const params = new URLSearchParams(searchParams);
    if (next === 'elenco') {
      params.delete(SECTION_PARAM);
    } else {
      params.set(SECTION_PARAM, next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  if (club.errorStatus === 404) {
    return (
      <StateMessage
        icon={SearchX}
        title="Clube não encontrado"
        description={`${club.error} O endereço pode estar errado ou o clube não existe.`}
        action={
          <Button variant="outline" asChild>
            <Link href="/clubes">
              <ArrowLeft data-icon="inline-start" />
              Voltar para clubes
            </Link>
          </Button>
        }
      />
    );
  }

  const data = club.data?.id === Number(id) ? club.data : undefined;

  if (club.error && !data) {
    return (
      <ErrorState
        title="Não foi possível carregar o clube"
        message={club.error}
        onRetry={club.reload}
      />
    );
  }

  const tabs: ClubTab<ClubSection>[] = [
    {
      value: 'elenco',
      label: 'Elenco',
      icon: Shirt,
      count: data?.players.length,
    },
    { value: 'escalacao', label: 'Escalação', icon: ClipboardList },
    {
      value: 'historico',
      label: 'Histórico',
      icon: History,
      count: allTransactions.data?.data.length,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {data ? <ClubHeader club={data} /> : <ClubHeaderSkeleton />}

      <ClubTabs tabs={tabs} value={section} onChange={changeSection} />

      <div
        role="tabpanel"
        id={`club-panel-${section}`}
        aria-labelledby={`club-tab-${section}`}
      >
        {section === 'historico' ? (
          <HistoryTab clubId={Number(id)} players={historyPlayers} />
        ) : section === 'elenco' ? (
          <SquadTable
            players={data?.players}
            loading={club.loading}
            error={club.error}
            onRetry={club.reload}
            onSell={setSelling}
          />
        ) : (
          data && <LineupTab club={data} />
        )}
      </div>

      {data && (
        <SellPlayerDialog
          player={selling}
          club={data}
          onClose={() => setSelling(undefined)}
          onSold={(result) => {
            setSelling(undefined);
            setSale(result);
          }}
        />
      )}
      <SaleResultDialog sale={sale} onClose={() => setSale(undefined)} />
    </div>
  );
}

function ClubHeader({ club }: { club: ClubDetails }) {
  const squadSize = club.players.length;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
            {club.acronym}
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {club.name}
            </h1>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline">Sigla {club.acronym}</Badge>
              <Badge variant="outline">
                <Shirt />
                {squadSize} de {MAX_SQUAD} jogadores
              </Badge>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={FREE_PLAYERS_PATH}>
            <ShoppingCart data-icon="inline-start" />
            Comprar jogadores
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Caixa"
          icon={Wallet}
          value={formatMoney(club.cash)}
          unit="moedas"
          description="Só muda por compras e vendas"
        />
        <StatCard
          label="Valor do elenco"
          icon={Coins}
          value={formatMoney(club.squad_value)}
          unit="moedas"
          description="Soma dos valores de mercado"
        />
        <StatCard
          label="Patrimônio"
          icon={Landmark}
          value={formatMoney(club.net_worth)}
          unit="moedas"
          description="Caixa + valor do elenco"
        />
        <StatCard
          label="Elenco"
          icon={Shirt}
          value={`${squadSize} de ${MAX_SQUAD}`}
          description={`Limite de ${MAX_SQUAD} jogadores`}
        />
      </div>
    </>
  );
}

function ClubHeaderSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </>
  );
}
