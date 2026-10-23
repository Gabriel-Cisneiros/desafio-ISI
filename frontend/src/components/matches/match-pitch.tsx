import { ArrowLeft, ArrowRight, Goal, HeartPulse } from 'lucide-react';
import { cn } from 'cn';
import type { Position } from '@/lib/api/types/enums';
import type { MatchTeam } from '@/lib/api/types/league';
import { getInitials } from '@/lib/format';
import { DUEL_ATTRIBUTE_SHORT_LABELS } from '@/lib/labels';
import type { MatchPlayer } from './match-teams';

const COLUMN_OF: Record<Position, number> = {
  GOL: 0,
  ZAG: 1,
  LAT: 1,
  MEI: 2,
  ATA: 3,
};

interface TeamOnPitch {
  team: MatchTeam;
  players: MatchPlayer[];
  side: 'home' | 'away';
}

export function MatchPitch({
  home,
  away,
}: {
  home: TeamOnPitch;
  away: TeamOnPitch;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-[repeating-linear-gradient(90deg,var(--pitch)_0_64px,var(--pitch-stripe)_64px_128px)] px-6 pt-14 pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 rounded-sm border border-white/30"
      >
        <div className="absolute inset-y-0 left-1/2 border-l border-white/30" />
        <div className="absolute top-1/2 left-1/2 size-28 -translate-1/2 rounded-full border border-white/30" />
        <div className="absolute top-1/2 left-0 h-56 w-24 -translate-y-1/2 border border-l-0 border-white/30" />
        <div className="absolute top-1/2 right-0 h-56 w-24 -translate-y-1/2 border border-r-0 border-white/30" />
      </div>
      <TeamTag team={home.team} side="home" />
      <TeamTag team={away.team} side="away" />
      <div className="relative grid min-h-72 grid-cols-8 items-center">
        <TeamColumns {...home} />
        <TeamColumns {...away} />
      </div>
    </div>
  );
}

function TeamTag({ team, side }: { team: MatchTeam; side: 'home' | 'away' }) {
  const Arrow = side === 'home' ? ArrowRight : ArrowLeft;
  return (
    <span
      className={cn(
        'absolute top-6 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white',
        side === 'home' ? 'left-8' : 'right-8',
      )}
    >
      <span
        className={cn(
          'size-2 rounded-full',
          side === 'home' ? 'bg-primary' : 'bg-white',
        )}
      />
      <span className="font-medium">{team.club_name}</span>
      {team.formation}
      <span className="text-white/60">| ataca</span>
      <Arrow className="size-3" />
    </span>
  );
}

function TeamColumns({ players, side }: TeamOnPitch) {
  return [0, 1, 2, 3].map((column) => {
    const columnPlayers = players.filter(
      (player) => COLUMN_OF[player.position] === column,
    );
    return (
      <div
        key={`${side}-${column}`}
        style={{
          gridColumn: side === 'home' ? column + 1 : 8 - column,
          gridRow: 1,
        }}
        className="flex flex-col items-center justify-center gap-6"
      >
        {columnPlayers.map((player) => (
          <PitchPlayer key={player.id} player={player} side={side} />
        ))}
      </div>
    );
  });
}

function PitchPlayer({
  player,
  side,
}: {
  player: MatchPlayer;
  side: 'home' | 'away';
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-full border-2 text-xs font-semibold',
            side === 'home'
              ? 'border-white bg-primary text-primary-foreground'
              : 'border-white bg-white text-foreground',
          )}
        >
          {getInitials(player.name)}
        </span>
        {player.condition === 'MAL_CONDICIONADO' && (
          <span
            title="Mal condicionado"
            className="absolute -top-1.5 -left-1.5 flex size-4 items-center justify-center rounded-full bg-warning text-white"
          >
            <HeartPulse className="size-2.5" />
          </span>
        )}
        {player.scored && (
          <span
            title="Gol no duelo"
            className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-white text-foreground"
          >
            <Goal className="size-2.5" />
          </span>
        )}
      </div>
      <span className="rounded-sm bg-black/40 px-1.5 text-xs font-medium whitespace-nowrap text-white">
        {player.name}
      </span>
      <span className="rounded-sm bg-black/30 px-1.5 text-[0.6875rem] whitespace-nowrap text-white/80">
        {player.position} ·{' '}
        {player.attributes
          .map(
            ({ attribute, value }) =>
              `${DUEL_ATTRIBUTE_SHORT_LABELS[attribute]} ${value}`,
          )
          .join(' · ')}
      </span>
    </div>
  );
}
