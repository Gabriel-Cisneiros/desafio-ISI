import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  NormalizeSearch,
  NotLessThan,
  NotTrueWith,
  ToQueryBoolean,
  ToQueryDecimal,
  ToQueryInteger,
} from './query.validators';

class QueryInput {
  @ToQueryInteger()
  integer?: unknown;

  @ToQueryDecimal()
  decimal?: unknown;

  @ToQueryBoolean()
  boolean?: unknown;

  @NormalizeSearch()
  search?: unknown;
}

function convert(query: Record<string, unknown>) {
  return plainToInstance(QueryInput, query);
}

class RangeInput {
  min?: unknown;

  @NotLessThan('min')
  max?: unknown;

  club_id?: unknown;

  @NotTrueWith('club_id')
  free?: unknown;
}

function check(input: Record<string, unknown>) {
  const errors = validateSync(plainToInstance(RangeInput, input));
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('conversão dos query params', () => {
  it.each([
    ['1', 1],
    ['15', 15],
    ['2147483647', 2147483647],
  ])('ToQueryInteger converte %j', (value, expected) => {
    expect(convert({ integer: value }).integer).toBe(expected);
  });

  it.each(['01', '0', '-1', '+1', '1.0', '1e2', 'abc', ' 1', ''])(
    'ToQueryInteger mantém %j como texto',
    (value) => {
      expect(convert({ integer: value }).integer).toBe(value);
    },
  );

  it.each([
    ['10', 10],
    ['10.5', 10.5],
    ['10.55', 10.55],
    ['0.5', 0.5],
    ['0', 0],
  ])('ToQueryDecimal converte %j', (value, expected) => {
    expect(convert({ decimal: value }).decimal).toBe(expected);
  });

  it.each(['10.555', '01', '.5', '10.', '10,5', '-1', '1e2', ''])(
    'ToQueryDecimal mantém %j como texto',
    (value) => {
      expect(convert({ decimal: value }).decimal).toBe(value);
    },
  );

  it.each([
    ['true', true],
    ['false', false],
  ])('ToQueryBoolean converte %j', (value, expected) => {
    expect(convert({ boolean: value }).boolean).toBe(expected);
  });

  it.each(['TRUE', 'False', '1', ''])(
    'ToQueryBoolean mantém %j como texto',
    (value) => {
      expect(convert({ boolean: value }).boolean).toBe(value);
    },
  );

  it.each([
    ['  meia   lua ', 'meia lua'],
    ['   ', ''],
  ])('NormalizeSearch transforma %j em %j', (value, expected) => {
    expect(convert({ search: value }).search).toBe(expected);
  });
});

describe('combinações de query params', () => {
  it.each([
    [{ min: 20, max: 20 }],
    [{ min: 20, max: 30 }],
    [{ max: 30 }],
    [{ min: 20, max: 'abc' }],
  ])('NotLessThan aceita %j', (input) => {
    expect(check(input)).toEqual([]);
  });

  it('NotLessThan recusa máximo menor que o mínimo', () => {
    expect(check({ min: 30, max: 20 })).toEqual([
      'O parâmetro max não pode ser menor que min.',
    ]);
  });

  it.each([[{ free: true }], [{ free: false, club_id: 1 }], [{ club_id: 1 }]])(
    'NotTrueWith aceita %j',
    (input) => {
      expect(check(input)).toEqual([]);
    },
  );

  it('NotTrueWith recusa free=true junto com club_id', () => {
    expect(check({ free: true, club_id: 1 })).toEqual([
      'O parâmetro free=true não pode ser usado junto com club_id.',
    ]);
  });
});
