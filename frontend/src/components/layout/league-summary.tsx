import { Clock, Swords, Trophy } from 'lucide-react';
import type { Match } from '@/lib/api/types/league';

export const LEAGUE_NAME = 'Liga Fictícia 2026';

function formatScore(match: Match): string {
  return `${match.home.club_name} ${match.home.goals} × ${match.away.goals} ${match.away.club_name}`;
}

interface LeagueSummaryProps {
  clubs: number | undefined;
  players: number | undefined;
  lastMatch: Match | null | undefined;
}

function SummaryRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Trophy;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function LeagueSummary({
  clubs,
  players,
  lastMatch,
}: LeagueSummaryProps) {
  const counts =
    clubs === undefined || players === undefined
      ? '…'
      : `${clubs} ${clubs === 1 ? 'clube' : 'clubes'} · ${players} ${players === 1 ? 'jogador' : 'jogadores'}`;
  const match =
    lastMatch === undefined
      ? '…'
      : lastMatch
        ? formatScore(lastMatch)
        : 'Nenhuma partida jogada';

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-3 group-data-[collapsible=icon]:hidden">
      <SummaryRow icon={Trophy} title={LEAGUE_NAME} description={counts} />
      <SummaryRow icon={Swords} title="Última partida" description={match} />
      <p className="flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        Horário de Brasília (UTC-3)
      </p>
    </div>
  );
}
