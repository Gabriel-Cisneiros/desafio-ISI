'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from 'cn';

export interface ClubTab<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface ClubTabsProps<T extends string> {
  tabs: ClubTab<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function ClubTabs<T extends string>({
  tabs,
  value,
  onChange,
}: ClubTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Seções do clube"
      className="flex gap-1 border-b"
    >
      {tabs.map(({ value: tab, label, icon: Icon, count }) => {
        const active = tab === value;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`club-tab-${tab}`}
            aria-selected={active}
            aria-controls={`club-panel-${tab}`}
            onClick={() => onChange(tab)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-2 pb-2.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              active
                ? 'border-primary font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
            {count !== undefined && (
              <span
                className={cn(
                  'rounded-md px-1.5 text-xs',
                  active
                    ? 'bg-primary-soft text-primary-soft-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
