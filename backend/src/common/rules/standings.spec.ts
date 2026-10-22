import { PlayedMatch, calculateStandings } from './standings';

const clubs = [
  { id: 1, name: 'Águias FC' },
  { id: 2, name: 'Delta FC' },
  { id: 3, name: 'Gama SC' },
  { id: 4, name: 'Épsilon EC' },
  { id: 5, name: 'Mangue FC' },
  { id: 6, name: 'Tubarões EC' },
];

function match(
  homeClubId: number,
  homeGoals: number,
  awayGoals: number,
  awayClubId: number,
): PlayedMatch {
  return { homeClubId, awayClubId, homeGoals, awayGoals };
}

describe('calculateStandings', () => {
  it('reproduz o exemplo de 6 clubes e 4 partidas', () => {
    const standings = calculateStandings(clubs, [
      match(1, 1, 2, 2),
      match(3, 2, 1, 4),
      match(4, 3, 2, 1),
      match(2, 0, 1, 3),
    ]);

    expect(
      standings.map((s) => [
        s.position,
        s.club.name,
        s.played,
        s.wins,
        s.draws,
        s.losses,
        s.goalsFor,
        s.goalsAgainst,
        s.goalDifference,
        s.points,
      ]),
    ).toEqual([
      [1, 'Gama SC', 2, 2, 0, 0, 3, 1, 2, 6],
      [2, 'Épsilon EC', 2, 1, 0, 1, 4, 4, 0, 3],
      [3, 'Delta FC', 2, 1, 0, 1, 2, 2, 0, 3],
      [4, 'Mangue FC', 0, 0, 0, 0, 0, 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0, 0, 0, 0, 0, 0],
      [6, 'Águias FC', 2, 0, 0, 2, 3, 5, -2, 0],
    ]);
  });

  it('dá 1 ponto a cada clube no empate', () => {
    const standings = calculateStandings(clubs.slice(0, 2), [
      match(1, 2, 2, 2),
    ]);

    expect(standings.map((s) => [s.club.id, s.draws, s.points])).toEqual([
      [1, 1, 1],
      [2, 1, 1],
    ]);
  });

  it('desempata pelo saldo, depois pelos gols marcados', () => {
    const standings = calculateStandings(clubs.slice(0, 4), [
      match(1, 3, 0, 2),
      match(3, 3, 2, 4),
    ]);

    expect(standings.map((s) => s.club.id)).toEqual([1, 3, 4, 2]);
  });

  it('desempata nomes iguais sem acento pelo id', () => {
    const standings = calculateStandings(
      [
        { id: 9, name: 'Aguias FC' },
        { id: 7, name: 'Águias FC' },
      ],
      [],
    );

    expect(standings.map((s) => [s.position, s.club.id])).toEqual([
      [1, 7],
      [2, 9],
    ]);
  });

  it('sem clubes devolve lista vazia', () => {
    expect(calculateStandings([], [])).toEqual([]);
  });
});
