'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Plus, Shield } from 'lucide-react';
import { clubPath } from '@/components/layout/navigation';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { StateMessage } from '@/components/shared/list-state';
import { PageHeader } from '@/components/shared/page-header';
import { SortMenu } from '@/components/shared/sort-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClubs } from '@/hooks/data/clubs';
import type { Club } from '@/lib/api/types/club';
import { CLUB_SORTS, type ClubSort } from '@/lib/api/types/enums';
import { formatMoney } from '@/lib/format';
import { CreateClubDialog } from './create-club-dialog';

const MAX_CLUBS = 20;
const NEW_PARAM = 'novo';

const SORT_LABELS: Record<ClubSort, string> = {
  name: 'Nome',
  net_worth_desc: 'Patrimônio (maior para o menor)',
  net_worth_asc: 'Patrimônio (menor para o maior)',
};

function readSort(value: string | null): ClubSort {
  return CLUB_SORTS.find((sort) => sort === value) ?? 'name';
}

const columns: DataTableColumn<Club>[] = [
  {
    key: 'club',
    header: 'Clube',
    cell: (club) => (
      <span className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-medium">
          {club.acronym}
        </span>
        <span className="font-medium">{club.name}</span>
      </span>
    ),
  },
  {
    key: 'acronym',
    header: 'Sigla',
    cell: (club) => <Badge variant="outline">{club.acronym}</Badge>,
  },
  {
    key: 'cash',
    header: 'Caixa',
    align: 'right',
    cell: (club) => formatMoney(club.cash),
  },
  {
    key: 'squad',
    header: 'Valor do elenco',
    align: 'right',
    cell: (club) => formatMoney(club.squad_value),
  },
  {
    key: 'net-worth',
    header: 'Patrimônio',
    align: 'right',
    cell: (club) => (
      <span className="font-semibold">{formatMoney(club.net_worth)}</span>
    ),
  },
  {
    key: 'link',
    header: <span className="sr-only">Página do clube</span>,
    align: 'right',
    cell: (club) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={clubPath(club.id)}>
          Ver clube
          <span className="sr-only">{club.name}</span>
          <ChevronRight data-icon="inline-end" />
        </Link>
      </Button>
    ),
  },
];

export function ClubsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = readSort(searchParams.get('sort'));
  const creating = searchParams.has(NEW_PARAM);
  const clubs = useClubs({ sort });

  function updateParams(change: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    change(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const setCreating = (open: boolean) =>
    updateParams((params) =>
      open ? params.set(NEW_PARAM, '1') : params.delete(NEW_PARAM),
    );
  const newClubButton = (variant: 'default' | 'outline') => (
    <Button variant={variant} onClick={() => setCreating(true)}>
      <Plus data-icon="inline-start" />
      Novo clube
    </Button>
  );
  const total = clubs.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Shield}
        title="Clubes"
        description={`Cada clube começa com ${formatMoney(300)} em caixa e sem jogadores. A liga aceita no máximo ${MAX_CLUBS} clubes.`}
        action={newClubButton('default')}
      />

      <DataTable
        columns={columns}
        rows={clubs.data}
        getRowKey={(club) => club.id}
        loading={clubs.loading}
        loadingLabel="Carregando clubes…"
        error={clubs.error}
        errorTitle="Não foi possível carregar os clubes"
        onRetry={clubs.reload}
        skeletonRows={6}
        empty={
          <StateMessage
            icon={Shield}
            title="Nenhum clube cadastrado"
            description={`Crie o primeiro clube com nome e sigla. Ele começa com ${formatMoney(300)} em caixa e sem jogadores.`}
            action={newClubButton('outline')}
          />
        }
        toolbar={
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="font-medium">
                {total} {total === 1 ? 'clube' : 'clubes'}
              </span>
              <Badge variant="secondary">
                {total} de {MAX_CLUBS}
              </Badge>
            </span>
            <SortMenu
              value={sort}
              labels={SORT_LABELS}
              onChange={(next) =>
                updateParams((params) =>
                  next === 'name'
                    ? params.delete('sort')
                    : params.set('sort', next),
                )
              }
            />
          </div>
        }
      />

      <CreateClubDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
