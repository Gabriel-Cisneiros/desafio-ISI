import { NotFoundException } from '@nestjs/common';
import { ParseIdPipe } from './parse-id.pipe';

describe('ParseIdPipe', () => {
  const pipe = new ParseIdPipe();

  it.each([
    ['1', 1],
    ['25', 25],
    ['2147483647', 2147483647],
  ])('converte o id válido %s', (value, expected) => {
    expect(pipe.transform(value)).toBe(expected);
  });

  it.each(['abc', '0', '-1', '1.5', '01', '', ' 1', '1e3', '2147483648'])(
    'trata o id "%s" como recurso inexistente',
    (value) => {
      expect(() => pipe.transform(value)).toThrow(NotFoundException);
    },
  );
});
