import type { ReactNode } from 'react';
import { cn } from 'cn';
import { Badge } from '@/components/ui/badge';
import type { Match, MatchTeam } from '@/lib/api/types/league';
import { formatDateTime } from '@/lib/format';
import { MATCH_RESULT_LABELS } from '@/lib/labels';

interface MatchScoreProps {
  match: Match;
  acronyms: Map<number, string>;
  showFormation?: boolean;
  action?: ReactNode;
}

function TeamSide({
  team,
  role,
  acronym,
  align,
  showFormation,
}: {
  team: MatchTeam;
  role: string;
  acronym: string | undefined;
  align: 'left' | 'right';
  showFormation: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-3',
        align === 'right' ? 'flex-row-reverse text-right' : 'text-left',
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
        {acronym ?? team.club_name.slice(0, 3).toUpperCase()}
      </span>
      <div
        className={cn(
          'flex flex-1 flex-col',
          align === 'right' ? 'items-end' : 'items-start',
        )}
      >
        <span className="text-base font-semibold">{team.club_name}</span>
        <span className="text-xs text-muted-foreground">
          {role}
          {showFormation && ` · ${team.formation}`}
        </span>
      </div>
    </div>
  );
}

export function MatchScore({
  match,
  acronyms,
  showFormation = false,
  action,
}: MatchScoreProps) {
  return (
    <div className="relative flex items-center rounded-xl border bg-card px-6 py-5">
      <div className="mx-auto flex w-full max-w-170 items-center gap-6">
        <TeamSide
          team={match.home}
          role="Mandante"
          acronym={acronyms.get(match.home.club_id)}
          align="right"
          showFormation={showFormation}
        />
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <span className="rounded-lg bg-muted px-4 py-1.5 text-2xl font-semibold tracking-tight">
            {match.home.goals} × {match.away.goals}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(match.played_at)}
          </span>
          <Badge variant="outline">{MATCH_RESULT_LABELS[match.result]}</Badge>
        </div>
        <TeamSide
          team={match.away}
          role="Visitante"
          acronym={acronyms.get(match.away.club_id)}
          align="left"
          showFormation={showFormation}
        />
      </div>
      {action && <div className="absolute right-6">{action}</div>}
    </div>
  );
}
