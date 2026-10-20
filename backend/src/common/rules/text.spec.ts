import {
  compareByNameAndId,
  compareNames,
  containsIgnoringCaseAndAccents,
  hasControlCharacters,
  normalizeName,
  removeAccents,
} from './text';

describe('normalizeName', () => {
  it('remove os espaços das pontas e junta os repetidos', () => {
    expect(normalizeName('  Meia   Zeta ')).toBe('Meia Zeta');
  });

  it('trata texto que fica vazio como ausente', () => {
    expect(normalizeName('')).toBeUndefined();
    expect(normalizeName('    ')).toBeUndefined();
  });

  it('mexe só no espaço U+0020', () => {
    expect(normalizeName('Meia Zeta')).toBe('Meia Zeta');
  });
});

describe('hasControlCharacters', () => {
  it.each(['Meia\tZeta', 'Meia\nZeta', 'Meia\u0000Zeta', 'Meia\u007fZeta'])(
    'recusa %j',
    (value) => {
      expect(hasControlCharacters(value)).toBe(true);
    },
  );

  it('aceita nomes comuns', () => {
    expect(hasControlCharacters('São Paulo F.C.')).toBe(false);
  });
});

describe('removeAccents', () => {
  it('remove acentos e cedilha', () => {
    expect(removeAccents('Épsilon Águias Ação')).toBe('Epsilon Aguias Acao');
  });
});

describe('compareNames', () => {
  const sort = (names: string[]) => [...names].sort(compareNames);

  it('põe "Épsilon" entre "Delta" e "Gama"', () => {
    expect(sort(['Gama', 'Épsilon', 'Delta'])).toEqual([
      'Delta',
      'Épsilon',
      'Gama',
    ]);
  });

  it('põe "Ana Lima" antes de "Ana-Maria"', () => {
    expect(sort(['Ana-Maria', 'Ana Lima'])).toEqual(['Ana Lima', 'Ana-Maria']);
  });

  it('põe o hífen antes das letras', () => {
    expect(sort(['Anab', 'Ana-b'])).toEqual(['Ana-b', 'Anab']);
  });

  it('ignora maiúsculas e minúsculas', () => {
    expect(sort(['beta', 'Alfa'])).toEqual(['Alfa', 'beta']);
  });

  it('põe o prefixo antes do nome mais longo', () => {
    expect(sort(['Ana Lima', 'Ana'])).toEqual(['Ana', 'Ana Lima']);
  });

  it('empata nomes iguais sem acento e sem diferenciar maiúsculas', () => {
    expect(compareNames('Águias FC', 'aguias fc')).toBe(0);
  });
});

describe('compareByNameAndId', () => {
  it('desfaz o empate pelo id crescente', () => {
    const clubs = [
      { id: 2, name: 'Águias FC' },
      { id: 3, name: 'Delta FC' },
      { id: 1, name: 'Aguias FC' },
    ];

    expect([...clubs].sort(compareByNameAndId).map((club) => club.id)).toEqual([
      1, 2, 3,
    ]);
  });
});

describe('containsIgnoringCaseAndAccents', () => {
  it.each([
    ['João Silva', 'joao'],
    ['Meia Lua', 'LUA'],
    ['Conceição', 'ceicao'],
    ['Meia Lua', 'ia l'],
  ])('%j contém %j', (text, search) => {
    expect(containsIgnoringCaseAndAccents(text, search)).toBe(true);
  });

  it('não encontra texto que não está no nome', () => {
    expect(containsIgnoringCaseAndAccents('Meia Lua', 'sol')).toBe(false);
  });
});
