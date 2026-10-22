import { Condition } from '../enums/condition.enum';
import { MatchResult } from '../enums/match-result.enum';
import { Position } from '../enums/position.enum';
import { MatchPlayer, applyCondition, orderTeam, playMatch } from './match';

const { GOL, ZAG, LAT, MEI, ATA } = Position;

function player(
  id: number,
  name: string,
  position: Position,
  attributes: Partial<MatchPlayer> = {},
): MatchPlayer {
  return {
    id,
    name,
    position,
    condition: Condition.APTO,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    ...attributes,
  };
}

const aguias = [
  player(34, 'Otto Rangel', ATA, { shooting: 75 }),
  player(31, 'Davi Lins', LAT, {
    condition: Condition.MAL_CONDICIONADO,
    dribbling: 74,
    defending: 66,
  }),
  player(30, 'Rui Prado', GOL, { defending: 77 }),
  player(33, 'Lauro Neves', MEI, { passing: 82 }),
  player(32, 'Téo Brandão', ZAG, { defending: 84 }),
];

const delta = [
  player(40, 'Ivo Teles', GOL, { defending: 72 }),
  player(41, 'Hugo Vaz', ZAG, { defending: 84 }),
  player(42, 'Lino Matos', LAT, { dribbling: 79, defending: 63 }),
  player(43, 'Nei Soares', MEI, { passing: 70 }),
  player(44, 'Ugo Falcão', ATA, { shooting: 81 }),
];

describe('applyCondition', () => {
  it.each([
    [74, Condition.MAL_CONDICIONADO, 63],
    [50, Condition.MAL_CONDICIONADO, 43],
    [66, Condition.MAL_CONDICIONADO, 56],
    [1, Condition.MAL_CONDICIONADO, 1],
    [99, Condition.MAL_CONDICIONADO, 84],
    [74, Condition.APTO, 74],
  ])('%i com %s vale %i', (value, condition, expected) => {
    expect(applyCondition(value, condition)).toBe(expected);
  });
});

describe('orderTeam', () => {
  it('ordena por posição, depois pelo nome e pelo id', () => {
    const team = [
      player(5, 'Zeca', MEI),
      player(4, 'Ana', ATA),
      player(3, 'Bia', MEI),
      player(2, 'Bia', MEI),
      player(1, 'Caio', GOL),
    ];

    expect(orderTeam(team).map((p) => p.id)).toEqual([1, 2, 3, 5, 4]);
  });
});

describe('playMatch', () => {
  it('reproduz o exemplo Águias FC 1 × 2 Delta FC', () => {
    const outcome = playMatch(aguias, delta);

    expect(outcome).toMatchObject({
      homeGoals: 1,
      awayGoals: 2,
      result: MatchResult.VISITANTE,
    });
    expect(
      outcome.duels.map((duel) => [
        duel.order,
        duel.attackingTeam,
        duel.attacker.player.name,
        duel.attacker.attribute,
        duel.attacker.value,
        duel.defender.player.name,
        duel.defender.value,
        duel.goal,
      ]),
    ).toEqual([
      [1, 'home', 'Otto Rangel', 'shooting', 75, 'Ivo Teles', 72, true],
      [2, 'home', 'Lauro Neves', 'passing', 82, 'Hugo Vaz', 84, false],
      [3, 'home', 'Davi Lins', 'dribbling', 63, 'Lino Matos', 63, false],
      [4, 'away', 'Ugo Falcão', 'shooting', 81, 'Rui Prado', 77, true],
      [5, 'away', 'Nei Soares', 'passing', 70, 'Téo Brandão', 84, false],
      [6, 'away', 'Lino Matos', 'dribbling', 79, 'Davi Lins', 56, true],
    ]);
    expect(
      outcome.duels.every((duel) => duel.defender.attribute === 'defending'),
    ).toBe(true);
  });

  it('não muda os atributos dos jogadores', () => {
    playMatch(aguias, delta);

    expect(aguias[1]).toMatchObject({ dribbling: 74, defending: 66 });
  });

  it.each([
    ['3-1', [ZAG, LAT, LAT, ATA], [ATA, LAT, LAT], [GOL, ZAG, LAT]],
    ['2-2', [ZAG, LAT, ATA, ATA], [ATA, ATA, LAT], [GOL, ZAG, LAT]],
    ['2-1-1', [ZAG, LAT, MEI, ATA], [ATA, MEI, LAT], [GOL, ZAG, LAT]],
    ['1-2-1', [ZAG, MEI, MEI, ATA], [ATA, MEI, MEI], [GOL, ZAG, MEI]],
  ])(
    'no %s, atacam e defendem as posições da tabela',
    (_, linePositions, attackers, defenders) => {
      const team = [
        player(1, 'Goleiro', GOL),
        ...linePositions.map((position, index) =>
          player(
            index + 2,
            `Jogador ${String.fromCharCode(65 + index)}`,
            position,
          ),
        ),
      ];

      const duels = playMatch(team, team).duels.slice(0, 3);

      expect(duels.map((duel) => duel.attacker.player.position)).toEqual(
        attackers,
      );
      expect(duels.map((duel) => duel.defender.player.position)).toEqual(
        defenders,
      );
    },
  );

  it('no 1-2-1, o MEI que vem antes pelo nome é o 2º e ataca no duelo 3', () => {
    const team = [
      player(1, 'Gol', GOL),
      player(2, 'Zag', ZAG),
      player(3, 'Bruno', MEI, { passing: 90 }),
      player(4, 'Alan', MEI, { passing: 60 }),
      player(5, 'Ata', ATA),
    ];

    const duels = playMatch(team, team).duels;

    expect(duels[1].attacker.player.name).toBe('Bruno');
    expect(duels[2].attacker.player.name).toBe('Alan');
    expect(duels[2].defender.player.name).toBe('Alan');
  });

  it('empata quando os gols são iguais, e duelo empatado não é gol', () => {
    const team = [
      player(1, 'Gol', GOL),
      player(2, 'Zag', ZAG),
      player(3, 'Lat', LAT),
      player(4, 'Mei', MEI),
      player(5, 'Ata', ATA),
    ];

    const outcome = playMatch(team, team);

    expect(outcome).toMatchObject({
      homeGoals: 0,
      awayGoals: 0,
      result: MatchResult.EMPATE,
    });
  });

  it('dá vitória ao mandante com mais gols', () => {
    const strong = aguias.map((p) => ({
      ...p,
      condition: Condition.APTO,
      shooting: 99,
      passing: 99,
      dribbling: 99,
    }));

    expect(playMatch(strong, delta)).toMatchObject({
      homeGoals: 3,
      result: MatchResult.MANDANTE,
    });
  });
});
