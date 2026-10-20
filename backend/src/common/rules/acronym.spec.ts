import {
  acronymMatchesName,
  hasAcronymFormat,
  hasRepeatedLettersOnly,
} from './acronym';

describe('hasAcronymFormat', () => {
  it('aceita 3 letras maiúsculas de A a Z', () => {
    expect(hasAcronymFormat('AGU')).toBe(true);
  });

  it.each(['agu', 'AG', 'AGUI', 'ÁGU', 'A1U', 'A U', 'AÇU'])(
    'recusa %j',
    (acronym) => {
      expect(hasAcronymFormat(acronym)).toBe(false);
    },
  );
});

describe('hasRepeatedLettersOnly', () => {
  it('detecta as três letras iguais', () => {
    expect(hasRepeatedLettersOnly('AAA')).toBe(true);
  });

  it.each(['AAB', 'ABA', 'ABC'])('aceita %s', (acronym) => {
    expect(hasRepeatedLettersOnly(acronym)).toBe(false);
  });
});

describe('acronymMatchesName', () => {
  it.each([
    ['AGU', 'Águias FC'],
    ['AFC', 'Águias FC'],
    ['TEC', 'Tubarões EC'],
    ['TUB', 'tubarões ec'],
    ['ACA', 'Ação Clube'],
    ['SPF', 'São Paulo F.C.'],
    ['MFC', 'Mangue-Futebol Clube'],
  ])('aceita %s para %j', (acronym, name) => {
    expect(acronymMatchesName(acronym, name)).toBe(true);
  });

  it.each([
    ['primeira letra diferente', 'GUA', 'Águias FC'],
    ['letras fora de ordem', 'AUG', 'Águias FC'],
    ['letra que não está no nome', 'AGZ', 'Águias FC'],
    ['letra repetida além do nome', 'AFF', 'Águias FC'],
  ])('recusa %s', (_, acronym, name) => {
    expect(acronymMatchesName(acronym, name)).toBe(false);
  });
});
