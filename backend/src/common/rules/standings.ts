import { compareByNameAndId } from './text';

export const POINTS_PER_WIN = 3;
export const POINTS_PER_DRAW = 1;

export interface StandingClub {
  id: number;
  name: string;
}

export interface PlayedMatch {
  homeClubId: number;
  awayClubId: number;
  homeGoals: number;
  awayGoals: number;
}

export interface Standing {
  position: number;
  club: StandingClub;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

type Tally = Omit<Standing, 'position' | 'goalDifference' | 'points'>;

function record(tally: Tally, goalsFor: number, goalsAgainst: number): void {
  tally.played += 1;
  tally.goalsFor += goalsFor;
  tally.goalsAgainst += goalsAgainst;
  if (goalsFor > goalsAgainst) {
    tally.wins += 1;
  } else if (goalsFor === goalsAgainst) {
    tally.draws += 1;
  } else {
    tally.losses += 1;
  }
}

function compareStandings(a: Standing, b: Standing): number {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    compareByNameAndId(a.club, b.club)
  );
}

export function calculateStandings(
  clubs: StandingClub[],
  matches: PlayedMatch[],
): Standing[] {
  const tallies = new Map<number, Tally>(
    clubs.map((club) => [
      club.id,
      {
        club,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
    ]),
  );

  for (const match of matches) {
    record(tallies.get(match.homeClubId)!, match.homeGoals, match.awayGoals);
    record(tallies.get(match.awayClubId)!, match.awayGoals, match.homeGoals);
  }

  return [...tallies.values()]
    .map((tally) => ({
      ...tally,
      position: 0,
      goalDifference: tally.goalsFor - tally.goalsAgainst,
      points: tally.wins * POINTS_PER_WIN + tally.draws * POINTS_PER_DRAW,
    }))
    .sort(compareStandings)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
}
