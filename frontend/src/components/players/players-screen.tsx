'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Coins,
  HeartPulse,
  Plus,
  Search,
  SearchX,
  Shield,
  Shirt,
  User,
  Users,
  X,
} from 'lucide-react';
import { StateMessage } from '@/components/shared/list-state';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClubs } from '@/hooks/data/clubs';
import { usePlayers } from '@/hooks/data/players';
import { CONDITIONS, POSITIONS } from '@/lib/api/types/enums';
import type { Player } from '@/lib/api/types/player';
import { formatMoney } from '@/lib/format';
import { CONDITION_LABELS, POSITION_LABELS } from '@/lib/labels';
import { ChangeConditionDialog } from './change-condition-dialog';
import { DeletePlayerDialog } from './delete-player-dialog';
import { CreatePlayerDialog } from './form/create-player-dialog';
import { EditPlayerDialog } from './form/edit-player-dialog';
import { PlayerCreatedDialog } from './form/player-created-dialog';
import { PlayerDetailsSheet } from './player-details-sheet';
import {
  AGE_RANGE,
  PAGE_SIZE,
  type PlayersFilters,
  type PlayersTab,
  VALUE_RANGE,
  countQuery,
  listQuery,
  readFilters,
  writeFilters,
} from './players-query';
import { PlayersTable } from './players-table';
import { FREE_WITH_CLUB_MESSAGE, PlayersToolbar } from './players-toolbar';
import { RangeFilter } from './range-filter';
import { SelectFilter } from './select-filter';

const SEARCH_DELAY_MS = 300;

const formatAge = (value: number) => String(value);

interface Chip {
  key: string;
  label: string;
  clear: Partial<PlayersFilters>;
}

const noop = () => {};

export function PlayersScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams)),
    [searchParams],
  );
  const [searchText, setSearchText] = useState(filters.search);
  const [detailsTarget, setDetailsTarget] = useState<Player>();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<Player>();
  const [editing, setEditing] = useState<Player>();
  const [changingCondition, setChangingCondition] = useState<Player>();
  const [deleting, setDeleting] = useState<Player>();

  const clubs = useClubs();
  const clubsById = useMemo(
    () => new Map(clubs.data?.map((club) => [club.id, club])),
    [clubs.data],
  );
  const list = usePlayers(listQuery(filters));
  const allCount = usePlayers(countQuery(filters, 'all'));
  const freeCount = usePlayers(
    countQuery(filters, 'free'),
    filters.clubId === undefined,
  );
  const inClubsCount = usePlayers(countQuery(filters, 'in-clubs'));

  function update(patch: Partial<PlayersFilters>) {
    const next = { ...filters, page: 1, ...patch };
    const query = writeFilters(next).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    setSearchText('');
    update({
      search: '',
      position: undefined,
      condition: undefined,
      clubId: undefined,
      minAge: undefined,
      maxAge: undefined,
      minValue: undefined,
      maxValue: undefined,
      tab: 'all',
    });
  }

  useEffect(() => {
    if (searchText === filters.search) {
      return;
    }
    const timer = setTimeout(
      () => update({ search: searchText }),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  });

  const totalPages = list.data?.meta.total_pages;
  useEffect(() => {
    if (totalPages && filters.page > totalPages) {
      update({ page: totalPages });
    }
  });

  const chips: Chip[] = [];
  if (filters.search.trim()) {
    chips.push({
      key: 'search',
      label: `Busca: ${filters.search.trim()}`,
      clear: { search: '' },
    });
  }
  if (filters.position) {
    chips.push({
      key: 'position',
      label: `Posição: ${POSITION_LABELS[filters.position]}`,
      clear: { position: undefined },
    });
  }
  if (filters.condition) {
    chips.push({
      key: 'condition',
      label: `Condição: ${CONDITION_LABELS[filters.condition]}`,
      clear: { condition: undefined },
    });
  }
  if (filters.clubId !== undefined) {
    chips.push({
      key: 'club',
      label: `Clube: ${clubsById.get(filters.clubId)?.name ?? filters.clubId}`,
      clear: { clubId: undefined },
    });
  }
  if (filters.minAge !== undefined || filters.maxAge !== undefined) {
    chips.push({
      key: 'age',
      label: `Idade: ${filters.minAge ?? AGE_RANGE.min} a ${filters.maxAge ?? AGE_RANGE.max}`,
      clear: { minAge: undefined, maxAge: undefined },
    });
  }
  if (filters.minValue !== undefined || filters.maxValue !== undefined) {
    chips.push({
      key: 'value',
      label: `Valor de mercado: ${formatMoney(filters.minValue ?? VALUE_RANGE.min)} a ${formatMoney(filters.maxValue ?? VALUE_RANGE.max)}`,
      clear: { minValue: undefined, maxValue: undefined },
    });
  }
  const onlySearch = chips.length === 1 && chips[0].key === 'search';
  const filtered = chips.length > 0 || filters.tab !== 'all';

  const counts: Record<PlayersTab, number | undefined> = {
    all: allCount.data?.meta.total_items,
    free: filters.clubId === undefined ? freeCount.data?.meta.total_items : 0,
    'in-clubs': inClubsCount.data?.meta.total_items,
  };

  const details =
    detailsTarget &&
    (list.data?.data.find((player) => player.id === detailsTarget.id) ??
      detailsTarget);
  const openCreate = () => setCreating(true);
  const handlers = {
    onDetails: setDetailsTarget,
    onEdit: setEditing,
    onChangeCondition: setChangingCondition,
    onBuy: noop,
    onDelete: setDeleting,
  };

  const clearButton = (
    <Button variant="outline" onClick={clearFilters}>
      <X data-icon="inline-start" />
      Limpar filtros
    </Button>
  );
  const search = filters.search.trim();
  const empty = search ? (
    <StateMessage
      icon={SearchX}
      title={`Nenhum jogador encontrado para “${search}”`}
      description="Confira a grafia ou tire alguns filtros. A busca ignora maiúsculas, minúsculas e acentos."
      action={clearButton}
    />
  ) : filtered ? (
    <StateMessage
      icon={SearchX}
      title="Nenhum jogador encontrado"
      description="Nenhum jogador atende a todos os filtros. Tire alguns filtros para ver mais jogadores."
      action={clearButton}
    />
  ) : (
    <StateMessage
      icon={Users}
      title="Nenhum jogador cadastrado"
      description="Com o banco recém-criado, a lista começa vazia."
      action={
        <Button variant="outline" onClick={openCreate}>
          Novo jogador
        </Button>
      }
    />
  );

  const clubFilter = (
    <SelectFilter
      label="Clube"
      icon={Shield}
      allLabel="Todos os clubes"
      options={(clubs.data ?? []).map((club) => ({
        value: club.id,
        label: club.name,
      }))}
      value={filters.clubId}
      onChange={(clubId) => update({ clubId })}
      disabled={filters.tab === 'free'}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Users}
        title="Jogadores"
        description="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
        action={
          <Button onClick={openCreate}>
            <Plus data-icon="inline-start" />
            Novo jogador
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Buscar por nome"
            placeholder="Buscar por nome"
            className="pl-9"
            value={searchText}
            maxLength={100}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
        <SelectFilter
          label="Posição"
          icon={Shirt}
          allLabel="Todas as posições"
          options={POSITIONS.map((value) => ({
            value,
            label: POSITION_LABELS[value],
          }))}
          value={filters.position}
          onChange={(position) => update({ position })}
        />
        <SelectFilter
          label="Condição"
          icon={HeartPulse}
          allLabel="Todas as condições"
          options={CONDITIONS.map((value) => ({
            value,
            label: CONDITION_LABELS[value],
          }))}
          value={filters.condition}
          onChange={(condition) => update({ condition })}
        />
        {filters.tab === 'free' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{clubFilter}</span>
            </TooltipTrigger>
            <TooltipContent>{FREE_WITH_CLUB_MESSAGE}</TooltipContent>
          </Tooltip>
        ) : (
          clubFilter
        )}
        <RangeFilter
          id="age"
          label="Idade"
          title="Idade"
          icon={User}
          limits={AGE_RANGE}
          decimals={0}
          format={formatAge}
          value={{ min: filters.minAge, max: filters.maxAge }}
          onChange={({ min, max }) => update({ minAge: min, maxAge: max })}
        />
        <RangeFilter
          id="value"
          label="Valor"
          title="Valor de mercado"
          icon={Coins}
          limits={VALUE_RANGE}
          decimals={2}
          format={formatMoney}
          value={{ min: filters.minValue, max: filters.maxValue }}
          onChange={({ min, max }) => update({ minValue: min, maxValue: max })}
        />
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {onlySearch ? 'Resultados para a busca:' : 'Filtros ativos:'}
          </span>
          {chips.map((chip) => (
            <Badge key={chip.key} variant="secondary" className="h-6 gap-1.5">
              {chip.label}
              <button
                type="button"
                aria-label={`Remover ${chip.label}`}
                className="rounded-sm hover:text-destructive"
                onClick={() => {
                  if (chip.key === 'search') {
                    setSearchText('');
                  }
                  update(chip.clear);
                }}
              >
                <X className="size-3.5" />
              </button>
            </Badge>
          ))}
          <Button variant="link" className="h-auto px-1" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      )}

      <PlayersTable
        players={list.data?.data}
        clubs={clubsById}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        empty={empty}
        toolbar={
          <PlayersToolbar
            tab={filters.tab}
            counts={counts}
            freeDisabled={filters.clubId !== undefined}
            sort={filters.sort}
            onTabChange={(tab) => update({ tab })}
            onSortChange={(sort) => update({ sort })}
          />
        }
        footer={
          list.data && (
            <Pagination
              page={list.data.meta.page}
              limit={PAGE_SIZE}
              totalItems={list.data.meta.total_items}
              totalPages={list.data.meta.total_pages}
              itemLabel={
                list.data.meta.total_items === 1 ? 'jogador' : 'jogadores'
              }
              onPageChange={(page) => update({ page })}
            />
          )
        }
        {...handlers}
      />

      <PlayerDetailsSheet
        player={details}
        club={
          details?.club_id == null ? undefined : clubsById.get(details.club_id)
        }
        onClose={() => setDetailsTarget(undefined)}
        onEdit={setEditing}
        onChangeCondition={setChangingCondition}
        onBuy={noop}
      />

      <CreatePlayerDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(player) => {
          setCreating(false);
          setCreated(player);
        }}
      />
      <PlayerCreatedDialog
        player={created}
        onClose={() => setCreated(undefined)}
        onDetails={(player) => {
          setCreated(undefined);
          setDetailsTarget(player);
        }}
      />
      <EditPlayerDialog
        player={editing}
        onClose={() => setEditing(undefined)}
      />
      <ChangeConditionDialog
        player={changingCondition}
        club={
          changingCondition?.club_id == null
            ? undefined
            : clubsById.get(changingCondition.club_id)
        }
        onClose={() => setChangingCondition(undefined)}
      />
      <DeletePlayerDialog
        player={deleting}
        onClose={() => setDeleting(undefined)}
      />
    </div>
  );
}
