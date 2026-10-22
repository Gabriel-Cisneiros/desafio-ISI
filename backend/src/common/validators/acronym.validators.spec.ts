import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  HasAcronymFormat,
  HasDifferentLetters,
  MatchesName,
} from './acronym.validators';

class ClubInput {
  name!: unknown;

  @HasAcronymFormat()
  @HasDifferentLetters()
  @MatchesName('name')
  acronym!: unknown;
}

function constraints(acronym: unknown, name: unknown) {
  const errors = validateSync(plainToInstance(ClubInput, { name, acronym }));
  return Object.assign(
    {},
    ...errors.map((error) => error.constraints),
  ) as Record<string, string>;
}

const rules = (acronym: unknown, name: unknown = 'Águias FC') =>
  Object.keys(constraints(acronym, name));

const check = (acronym: unknown, name: unknown = 'Águias FC') =>
  Object.values(constraints(acronym, name));

describe('validadores de sigla', () => {
  it.each(['AGU', 'AGF', 'ASC'])('aceita %s para Águias FC', (acronym) => {
    expect(rules(acronym)).toEqual([]);
  });

  it('não mexe em valores que não são texto', () => {
    expect(rules(15)).toEqual([]);
  });

  it.each(['agu', 'ÁGU', 'AG', 'AGUA', 'A1U', ''])(
    'recusa %j pelo formato',
    (acronym) => {
      expect(rules(acronym)).toEqual(['hasAcronymFormat']);
    },
  );

  it('recusa as três letras iguais', () => {
    expect(rules('AAA', 'Aaa Clube')).toEqual(['hasDifferentLetters']);
  });

  it.each([
    ['que não começa pela primeira letra do nome', 'GUA'],
    ['com letras fora de ordem', 'AFG'],
    ['com letra que não está no nome', 'AGZ'],
  ])('recusa sigla %s', (_, acronym) => {
    expect(rules(acronym)).toEqual(['matchesName']);
  });

  it('não compara com o nome quando o nome não é texto', () => {
    expect(rules('AGU', null)).toEqual([]);
  });

  it('explica cada regra', () => {
    expect(check('agu')).toEqual([
      'O campo acronym deve ter exatamente 3 letras de A a Z, maiúsculas e sem acento.',
    ]);
    expect(check('AAA', 'Aaa Clube')).toEqual([
      'As três letras do campo acronym não podem ser todas iguais.',
    ]);
    expect(check('GUA')).toEqual([
      'O campo acronym deve usar letras que aparecem no name nessa ordem, começando pela primeira letra do name.',
    ]);
  });
});
