import { HeartPulse, Plus } from 'lucide-react';
import { cn } from 'cn';
import type { Formation } from '@/lib/api/types/enums';
import type { Player } from '@/lib/api/types/player';
import { getInitials } from '@/lib/format';
import { formationSlots, lastName, sectorRows } from './lineup-rules';

interface LineupPitchProps {
  formation: Formation;
  starters: (Player | undefined)[];
}

export function LineupPitch({ formation, starters }: LineupPitchProps) {
  const slots = formationSlots(formation);

  return (
    <div className="relative overflow-hidden rounded-lg bg-[repeating-linear-gradient(180deg,var(--pitch)_0_40px,var(--pitch-stripe)_40px_80px)] px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-sm border border-white/30"
      >
        <div className="absolute inset-x-0 top-1/2 border-t border-white/30" />
        <div className="absolute top-1/2 left-1/2 size-20 -translate-1/2 rounded-full border border-white/30" />
        <div className="absolute bottom-0 left-1/2 h-16 w-40 -translate-x-1/2 border border-b-0 border-white/30" />
        <div className="absolute bottom-0 left-1/2 h-6 w-16 -translate-x-1/2 border border-b-0 border-white/30" />
      </div>
      <div className="relative flex flex-col gap-6">
        {sectorRows(formation).map(({ sector, indexes }) => (
          <div key={sector} className="flex justify-around">
            {indexes.map((index) => (
              <PitchSpot
                key={index}
                player={starters[index]}
                label={slots[index].label}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PitchSpot({
  player,
  label,
}: {
  player: Player | undefined;
  label: string;
}) {
  return (
    <div className="flex w-20 flex-col items-center gap-1.5">
      <div className="relative">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-full text-xs font-medium',
            player
              ? 'border-2 border-white bg-primary text-primary-foreground'
              : 'border border-dashed border-white/70 text-white/80',
          )}
        >
          {player ? getInitials(player.name) : <Plus className="size-4" />}
        </span>
        {player?.condition === 'MAL_CONDICIONADO' && (
          <span
            title="Mal condicionado"
            className="absolute -top-1.5 -left-1.5 flex size-4 items-center justify-center rounded-full bg-warning text-white"
          >
            <HeartPulse className="size-2.5" />
          </span>
        )}
      </div>
      <span className="rounded-sm bg-black/40 px-1.5 text-xs font-medium text-white">
        {player ? lastName(player.name) : label}
      </span>
    </div>
  );
}
