'use client';

import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="font-normal">
            <ArrowUpDown data-icon="inline-start" />
            Ordenar: {SORT_LABELS[sort].charAt(0).toLowerCase()}
            {SORT_LABELS[sort].slice(1)}
            <ChevronDown data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-56">
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => onSortChange(value as PlayerSort)}
          >
            {(Object.keys(SORT_LABELS) as PlayerSort[]).map((value) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {SORT_LABELS[value]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
