import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  description: string;
  icon: LucideIcon;
}

export function StatCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4" />
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight">
        {value}
        {unit && (
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
