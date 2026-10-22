import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { IsBrazilDateTime } from './datetime.validators';

class DateInput {
  @IsBrazilDateTime()
  date!: unknown;
}

function check(date: unknown) {
  const errors = validateSync(plainToInstance(DateInput, { date }));
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('IsBrazilDateTime', () => {
  it.each([
    '2027-03-02T10:15-03:00',
    '2028-02-29T23:59-03:00',
    '2027-01-01T00:00-03:00',
  ])('aceita %s', (date) => {
    expect(check(date)).toEqual([]);
  });

  it('não mexe em valores que não são texto', () => {
    expect(check(20270302)).toEqual([]);
  });

  it.each([
    ['sem fuso', '2027-03-02T10:15'],
    ['com segundos', '2027-03-02T10:15:00-03:00'],
    ['com outro fuso', '2027-03-02T10:15-02:00'],
    ['em UTC', '2027-03-02T13:15Z'],
    ['29 de fevereiro fora do ano bissexto', '2027-02-29T10:15-03:00'],
    ['dia que não existe no mês', '2027-04-31T10:15-03:00'],
    ['24 horas', '2027-03-02T24:00-03:00'],
    ['60 minutos', '2027-03-02T10:60-03:00'],
    ['vazio', ''],
  ])('recusa data %s', (_, date) => {
    expect(check(date)).toEqual([
      'O campo date deve ser uma data e hora existente no formato AAAA-MM-DDTHH:MM-03:00, como 2027-03-02T10:15-03:00.',
    ]);
  });
});
