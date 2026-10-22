import type { ReactNode } from 'react';
import { PlayerAvatar } from '@/components/shared/player-avatar';
import type { Player } from '@/lib/api/types/player';
import { POSITION_LABELS } from '@/lib/labels';

interface PlayerSummaryProps {
  player: Player;
  aside: ReactNode;
}

export function PlayerSummary({ player, aside }: PlayerSummaryProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted-subtle px-4 py-3">
      <PlayerAvatar id={player.id} name={player.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{player.name}</span>
        <span className="text-xs text-muted-foreground">
          {player.position} · {POSITION_LABELS[player.position]} · {player.age}{' '}
          anos
        </span>
      </div>
      {aside}
    </div>
  );
}
