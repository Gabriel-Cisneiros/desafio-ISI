import { Position } from '../common/enums/position.enum';
import { PlayerResponse } from './interfaces/player.interface';
import { PlayerSort, comparePlayersBy, parsePlayerSort } from './player-sort';

describe('parsePlayerSort', () => {
  it.each([
    ['name', [PlayerSort.NAME]],
    ['position', [PlayerSort.POSITION]],
    ['value_desc,name', [PlayerSort.VALUE_DESC, PlayerSort.NAME]],
    ['age_asc,value_asc', [PlayerSort.AGE_ASC, PlayerSort.VALUE_ASC]],
  ])('aceita %s', (value, expected) => {
    expect(parsePlayerSort(value)).toEqual(expected);
  });

  it.each([
    ['vazio', ''],
    ['maiúsculas trocadas', 'POSITION'],
    ['valor fora da lista', 'overall'],
    ['espaço depois da vírgula', 'name, age_asc'],
    ['mais de dois critérios', 'name,age_asc,position'],
    ['o mesmo campo duas vezes', 'value_asc,value_desc'],
    ['o mesmo critério duas vezes', 'name,name'],
    ['vírgula sobrando', 'name,'],
  ])('recusa %s', (_, value) => {
    expect(parsePlayerSort(value)).toBeUndefined();
  });
});

describe('comparePlayersBy', () => {
  const player = (
    id: number,
    name: string,
    position: Position,
    age: number,
    marketValue: number,
  ) =>
    ({
      id,
      name,
      position,
      age,
      market_value: marketValue,
    }) as PlayerResponse;

  const players = [
    player(1, 'Gama Silva', Position.ATA, 30, 40),
    player(2, 'Épsilon Lima', Position.GOL, 25, 40),
    player(3, 'Delta Rocha', Position.MEI, 25, 55.5),
    player(4, 'Ana Lima', Position.LAT, 19, 12),
    player(5, 'Ana Lima', Position.ZAG, 30, 12),
  ];

  const order = (sort: PlayerSort[]) =>
    [...players].sort(comparePlayersBy(sort)).map(({ id }) => id);

  it('ordena pelo nome, com empate pelo id', () => {
    expect(order([PlayerSort.NAME])).toEqual([4, 5, 3, 2, 1]);
  });

  it('ordena pelo valor de mercado, com empate pelo nome', () => {
    expect(order([PlayerSort.VALUE_DESC])).toEqual([3, 2, 1, 4, 5]);
    expect(order([PlayerSort.VALUE_ASC])).toEqual([4, 5, 2, 1, 3]);
  });

  it('ordena pela idade', () => {
    expect(order([PlayerSort.AGE_ASC])).toEqual([4, 3, 2, 5, 1]);
    expect(order([PlayerSort.AGE_DESC])).toEqual([5, 1, 3, 2, 4]);
  });

  it('ordena pela posição na ordem GOL, ZAG, LAT, MEI, ATA', () => {
    expect(order([PlayerSort.POSITION])).toEqual([2, 5, 4, 3, 1]);
  });

  it('usa o segundo critério para desempatar o primeiro', () => {
    expect(order([PlayerSort.AGE_DESC, PlayerSort.VALUE_ASC])).toEqual([
      5, 1, 2, 3, 4,
    ]);
  });
});
