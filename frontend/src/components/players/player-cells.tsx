import Link from 'next/link';
import { cn } from 'cn';
import { clubPath } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import type { Club } from '@/lib/api/types/club';

export const HIGH_AGILITY = 80;
export const LOW_AGILITY = 30;

export function AgilityBar({ agility }: { agility: number }) {
  const color =
    agility >= HIGH_AGILITY
      ? 'bg-chart-positive'
      : agility <= LOW_AGILITY
        ? 'bg-chart-negative'
        : 'bg-muted-foreground';

  return (
    <span className="flex items-center gap-2">
      <span className="w-6 text-right">{agility}</span>
      <span
        aria-hidden
        className="h-1 w-10 overflow-hidden rounded-full bg-muted"
      >
        <span
          className={cn('block h-full rounded-full', color)}
          style={{ width: `${agility}%` }}
        />
      </span>
    </span>
  );
}

export function ClubCell({ club }: { club: Club | undefined }) {
  if (!club) {
    return <Badge variant="secondary">Livre</Badge>;
  }
  return (
    <span className="flex items-center gap-2">
      <Badge variant="secondary">{club.acronym}</Badge>
      <Link
        href={clubPath(club.id)}
        className="underline underline-offset-2 hover:text-primary"
      >
        {club.name}
      </Link>
    </span>
  );
}
