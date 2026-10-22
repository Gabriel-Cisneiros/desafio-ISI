import { ValidationArguments, registerDecorator } from 'class-validator';
import { ATTRIBUTE_NAMES } from '../rules/overall';
import { fieldLabel } from './field-labels';

export const VETERAN_AGILITY_MIN_AGE = 35;
export const VETERAN_MAX_AGILITY = 85;
export const MAX_ATTRIBUTES_SUM = 480;
export const FIXED_POTENTIAL_MIN_AGE = 33;

const ATTRIBUTE_LABELS = new Intl.ListFormat('pt-BR').format(
  ATTRIBUTE_NAMES.map(fieldLabel),
);

type PlayerFields = Record<string, unknown>;

function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

function attributeValues(player: PlayerFields): number[] | undefined {
  const values = ATTRIBUTE_NAMES.map((name) => player[name]);
  return values.every(isInteger) ? values : undefined;
}

function hasFixedPotential(player: PlayerFields): boolean {
  return isInteger(player.age) && player.age >= FIXED_POTENTIAL_MIN_AGE;
}

function registerPlayerRule(
  name: string,
  validate: (value: unknown, player: PlayerFields) => boolean,
  message: (args: ValidationArguments) => string,
): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name,
      target: target.constructor,
      propertyName: propertyName as string,
      validator: {
        validate: (value: unknown, args) =>
          validate(value, args!.object as PlayerFields),
        defaultMessage: (args) => message(args!),
      },
    });
  };
}

export function AgilityAllowedForAge(): PropertyDecorator {
  return registerPlayerRule(
    'agilityAllowedForAge',
    (agility, { age }) =>
      !isInteger(agility) ||
      !isInteger(age) ||
      age < VETERAN_AGILITY_MIN_AGE ||
      agility <= VETERAN_MAX_AGILITY,
    ({ property }) =>
      `Com ${VETERAN_AGILITY_MIN_AGE} anos ou mais, o campo ${fieldLabel(property)} deve ser no máximo ${VETERAN_MAX_AGILITY}.`,
  );
}

export function AttributesSumWithinLimit(): PropertyDecorator {
  return registerPlayerRule(
    'attributesSumWithinLimit',
    (_, player) => {
      const values = attributeValues(player);
      return (
        !values ||
        values.reduce((sum, value) => sum + value, 0) <= MAX_ATTRIBUTES_SUM
      );
    },
    () =>
      `A soma de ${ATTRIBUTE_LABELS} deve ser no máximo ${MAX_ATTRIBUTES_SUM}.`,
  );
}

export function PotentialMatchesAttributes(): PropertyDecorator {
  return registerPlayerRule(
    'potentialMatchesAttributes',
    (potential, player) => {
      const values = attributeValues(player);
      if (!isInteger(potential) || !values) {
        return true;
      }

      const highest = Math.max(...values);
      return hasFixedPotential(player)
        ? potential === highest
        : potential >= highest;
    },
    ({ property, object }) =>
      hasFixedPotential(object as PlayerFields)
        ? `Com ${FIXED_POTENTIAL_MIN_AGE} anos ou mais, o campo ${fieldLabel(property)} deve ser igual ao maior dos seis atributos.`
        : `O campo ${fieldLabel(property)} deve ser maior ou igual ao maior dos seis atributos.`,
  );
}
