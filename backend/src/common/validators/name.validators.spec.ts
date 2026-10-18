import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  CharacterLength,
  HasNoControlCharacters,
  HasNoDigits,
  NormalizeName,
  WordCount,
} from './name.validators';

class NameInput {
  @NormalizeName()
  @HasNoControlCharacters()
  @CharacterLength(3, 10)
  @WordCount(2, 3)
  @HasNoDigits()
  name!: unknown;
}

function check(name: unknown) {
  const input = plainToInstance(NameInput, { name });
  const errors = validateSync(input);
  return {
    name: input.name,
    rules: errors.flatMap((error) => Object.keys(error.constraints ?? {})),
  };
}

describe('validadores de nome', () => {
  it('normaliza os espaços antes de validar', () => {
    expect(check('  Ana   Lima ')).toEqual({ name: 'Ana Lima', rules: [] });
  });

  it('transforma texto só de espaços em ausente', () => {
    expect(check('   ').name).toBeUndefined();
  });

  it('não mexe em valores que não são texto', () => {
    expect(check(15)).toEqual({ name: 15, rules: [] });
  });

  it.each([
    ['Ana\tLima', 'hasNoControlCharacters'],
    ['Ana\nLima', 'hasNoControlCharacters'],
    ['Ab', 'characterLength'],
    ['Ana Beatriz Lima', 'characterLength'],
    ['Ana', 'wordCount'],
    ['A B C D', 'wordCount'],
    ['Ana -', 'wordCount'],
    ['Ana Lima 2', 'hasNoDigits'],
  ])('recusa %j pela regra %s', (name, rule) => {
    expect(check(name).rules).toContain(rule);
  });

  it('conta caracteres pelos pontos de código, não pelas unidades UTF-16', () => {
    expect(check('Ana 𝒜𝒷').rules).not.toContain('characterLength');
  });
});
