import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  AgilityAllowedForAge,
  AttributesSumWithinLimit,
  PotentialMatchesAttributes,
} from './player.validators';

class PlayerInput {
  @AgilityAllowedForAge()
  agility!: unknown;

  age!: unknown;
  pace!: unknown;
  shooting!: unknown;
  passing!: unknown;
  dribbling!: unknown;
  defending!: unknown;

  @AttributesSumWithinLimit()
  physical!: unknown;

  @PotentialMatchesAttributes()
  potential!: unknown;
}

const validPlayer = {
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

function failedRules(overrides: Record<string, unknown>): string[] {
  const input = plainToInstance(PlayerInput, { ...validPlayer, ...overrides });
  return validateSync(input).flatMap((error) =>
    Object.keys(error.constraints ?? {}),
  );
}

describe('validadores de jogador', () => {
  it('aceita um jogador válido', () => {
    expect(failedRules({})).toEqual([]);
  });

  describe('agilidade e idade', () => {
    it.each([
      [34, 100],
      [35, 85],
      [45, 1],
    ])('aceita %i anos com agilidade %i', (age, agility) => {
      expect(failedRules({ age, agility, potential: 82 })).toEqual([]);
    });

    it('recusa agilidade acima de 85 com 35 anos ou mais', () => {
      expect(failedRules({ age: 35, agility: 86, potential: 82 })).toEqual([
        'agilityAllowedForAge',
      ]);
    });

    it('não avalia a regra quando a idade não é um inteiro', () => {
      expect(failedRules({ age: '40', agility: 99 })).toEqual([]);
    });
  });

  describe('soma dos atributos', () => {
    it('aceita soma exatamente 480', () => {
      expect(
        failedRules({
          pace: 80,
          shooting: 80,
          passing: 80,
          dribbling: 80,
          defending: 80,
          physical: 80,
          potential: 80,
        }),
      ).toEqual([]);
    });

    it('recusa soma 481', () => {
      expect(
        failedRules({
          pace: 81,
          shooting: 80,
          passing: 80,
          dribbling: 80,
          defending: 80,
          physical: 80,
          potential: 81,
        }),
      ).toEqual(['attributesSumWithinLimit']);
    });

    it('não avalia a soma quando algum atributo não é inteiro', () => {
      expect(failedRules({ pace: 99.5, physical: 99 })).not.toContain(
        'attributesSumWithinLimit',
      );
    });
  });

  describe('potencial', () => {
    it('aceita potencial igual ao maior atributo', () => {
      expect(failedRules({ potential: 82 })).toEqual([]);
    });

    it('recusa potencial menor que o maior atributo', () => {
      expect(failedRules({ potential: 81 })).toEqual([
        'potentialMatchesAttributes',
      ]);
    });

    it('com 33 anos ou mais, recusa potencial acima do maior atributo', () => {
      expect(failedRules({ age: 33, potential: 83 })).toEqual([
        'potentialMatchesAttributes',
      ]);
    });

    it('com 33 anos ou mais, aceita potencial igual ao maior atributo', () => {
      expect(failedRules({ age: 33, potential: 82 })).toEqual([]);
    });

    it('com 32 anos, aceita potencial acima do maior atributo', () => {
      expect(failedRules({ age: 32, potential: 99 })).toEqual([]);
    });
  });
});
