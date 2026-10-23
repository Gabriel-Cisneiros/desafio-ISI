import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PenaltyBadge({ rate }: { rate: number }) {
  if (rate === 0) {
    return (
      <Badge variant="success">
        <Check />
        0%
      </Badge>
    );
  }
  return (
    <Badge variant={rate >= 20 ? 'destructive' : 'warning'}>{rate}%</Badge>
  );
}
