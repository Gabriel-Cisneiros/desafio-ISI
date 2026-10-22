'use client';

import { cn } from 'cn';
import { SortMenu } from '@/components/shared/sort-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PlayerSort } from '@/lib/api/types/enums';
import { type PlayersTab, SORT_LABELS } from './players-query';

export const FREE_WITH_CLUB_MESSAGE =
  '“Livres” não combina com o filtro por clube.';

const TABS: { value: PlayersTab; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'free', label: 'Livres' },
  { value: 'in-clubs', label: 'Em clubes' },
];

interface PlayersToolbarProps {
  tab: PlayersTab;
  counts: Record<PlayersTab, number | undefined>;
  freeDisabled: boolean;
  sort: PlayerSort;
  onTabChange: (tab: PlayersTab) => void;
  onSortChange: (sort: PlayerSort) => void;
}

export function PlayersToolbar({
  tab,
  counts,
  freeDisabled,
  sort,
  onTabChange,
  onSortChange,
}: PlayersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Situação do jogador"
        className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1"
      >
        {TABS.map((item) => {
          const active = item.value === tab;
          const disabled = item.value === 'free' && freeDisabled;
          const button = (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onTabChange(item.value)}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors disabled:opacity-50',
                active
                  ? 'bg-background font-medium text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
              <span className="font-normal text-muted-foreground">
                {counts[item.value] ?? '…'}
              </span>
            </button>
          );
          return disabled ? (
            <Tooltip key={item.value}>
              <TooltipTrigger asChild>
                <span>{button}</span>
              </TooltipTrigger>
              <TooltipContent>{FREE_WITH_CLUB_MESSAGE}</TooltipContent>
            </Tooltip>
          ) : (
            button
          );
        })}
      </div>

      <SortMenu value={sort} labels={SORT_LABELS} onChange={onSortChange} />
    </div>
  );
}
