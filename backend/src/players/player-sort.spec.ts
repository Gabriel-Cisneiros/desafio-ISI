import { PlayerSort, parsePlayerSort } from './player-sort';

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
