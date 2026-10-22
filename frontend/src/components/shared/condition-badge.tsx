import { Badge } from '@/components/ui/badge';
import type { Condition } from '@/lib/api/types/enums';
import { CONDITION_LABELS } from '@/lib/labels';

const VARIANTS = {
  APTO: 'success',
  MAL_CONDICIONADO: 'warning',
  DOENTE: 'destructive',
} as const;

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <Badge variant={VARIANTS[condition]}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {CONDITION_LABELS[condition]}
    </Badge>
  );
}
