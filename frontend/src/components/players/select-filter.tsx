'use client';

import { ChevronDown, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ALL = '';

interface SelectFilterProps<T extends string | number> {
  label: string;
  icon: LucideIcon;
  allLabel: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  disabled?: boolean;
}

export function SelectFilter<T extends string | number>({
  label,
  icon: Icon,
  allLabel,
  options,
  value,
  onChange,
  disabled = false,
}: SelectFilterProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" className="font-normal">
          <Icon data-icon="inline-start" className="text-muted-foreground" />
          {selected ? `${label}: ${selected.label}` : label}
          <ChevronDown
            data-icon="inline-end"
            className="text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-48">
        <DropdownMenuRadioGroup
          value={value === undefined ? ALL : String(value)}
          onValueChange={(next) =>
            onChange(
              next === ALL
                ? undefined
                : options.find((option) => String(option.value) === next)
                    ?.value,
            )
          }
        >
          <DropdownMenuRadioItem value={ALL}>{allLabel}</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={String(option.value)}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
