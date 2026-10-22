import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DifferentFrom } from './comparison.validators';

class PairInput {
  first?: unknown;

  @DifferentFrom('first')
  second?: unknown;
}

function check(input: Record<string, unknown>) {
  const errors = validateSync(plainToInstance(PairInput, input));
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('DifferentFrom', () => {
  it.each([
    [{ first: 1, second: 2 }],
    [{ first: 1, second: '1' }],
    [{ second: 2 }],
  ])('aceita %j', (input) => {
    expect(check(input)).toEqual([]);
  });

  it('recusa valores iguais', () => {
    expect(check({ first: 1, second: 1 })).toEqual([
      'O campo second deve ser diferente de first.',
    ]);
  });
});
