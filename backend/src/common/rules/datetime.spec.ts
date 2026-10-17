import { formatBrazilDateTime, parseBrazilDateTime } from './datetime';

describe('parseBrazilDateTime', () => {
  it('lê o horário de Brasília como o instante UTC três horas depois', () => {
    expect(parseBrazilDateTime('2027-03-02T10:15-03:00')?.toISOString()).toBe(
      '2027-03-02T13:15:00.000Z',
    );
  });

  it('passa para o dia seguinte em UTC depois das 21h', () => {
    expect(parseBrazilDateTime('2026-12-31T23:59-03:00')?.toISOString()).toBe(
      '2027-01-01T02:59:00.000Z',
    );
  });

  it.each(['2028-02-29T00:00-03:00', '2000-02-29T12:00-03:00'])(
    'aceita o dia 29 de fevereiro em ano bissexto: %s',
    (value) => {
      expect(parseBrazilDateTime(value)).toBeInstanceOf(Date);
    },
  );

  it.each([
    ['dia inexistente', '2027-02-30T10:15-03:00'],
    ['29 de fevereiro fora de ano bissexto', '2027-02-29T10:15-03:00'],
    [
      '29 de fevereiro em ano centenário não bissexto',
      '2100-02-29T10:15-03:00',
    ],
    ['dia 31 em mês de 30 dias', '2027-04-31T10:15-03:00'],
    ['dia zero', '2027-03-00T10:15-03:00'],
    ['mês zero', '2027-00-10T10:15-03:00'],
    ['mês 13', '2027-13-10T10:15-03:00'],
    ['hora 24', '2027-03-02T24:00-03:00'],
    ['minuto 60', '2027-03-02T10:60-03:00'],
    ['sem fuso', '2027-03-02T10:15'],
    ['outro fuso', '2027-03-02T10:15-02:00'],
    ['fuso Z', '2027-03-02T10:15Z'],
    ['com segundos', '2027-03-02T10:15:00-03:00'],
    ['sem zeros à esquerda', '2027-3-2T10:15-03:00'],
    ['espaço no lugar do T', '2027-03-02 10:15-03:00'],
    ['espaço nas pontas', ' 2027-03-02T10:15-03:00 '],
    ['só a data', '2027-03-02'],
    ['texto vazio', ''],
  ])('recusa %s', (_, value) => {
    expect(parseBrazilDateTime(value)).toBeUndefined();
  });
});

describe('formatBrazilDateTime', () => {
  it('formata no horário de Brasília com segundos', () => {
    expect(formatBrazilDateTime(new Date('2026-11-05T19:40:00Z'))).toBe(
      '2026-11-05T16:40:00-03:00',
    );
  });

  it('volta para o dia anterior antes das 3h em UTC', () => {
    expect(formatBrazilDateTime(new Date('2026-11-06T01:30:45.999Z'))).toBe(
      '2026-11-05T22:30:45-03:00',
    );
  });

  it('devolve o mesmo instante que foi lido', () => {
    const date = parseBrazilDateTime('2027-03-02T10:15-03:00')!;
    expect(formatBrazilDateTime(date)).toBe('2027-03-02T10:15:00-03:00');
  });
});
