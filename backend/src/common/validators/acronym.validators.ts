import { registerDecorator } from 'class-validator';
import {
  acronymMatchesName,
  hasAcronymFormat,
  hasRepeatedLettersOnly,
} from '../rules/acronym';
import { fieldLabel } from './field-labels';
import { registerStringRule } from './name.validators';

export function HasAcronymFormat(): PropertyDecorator {
  return registerStringRule(
    'hasAcronymFormat',
    hasAcronymFormat,
    (property) =>
      `O campo ${property} deve ter exatamente 3 letras de A a Z, maiúsculas e sem acento.`,
  );
}

export function HasDifferentLetters(): PropertyDecorator {
  return registerStringRule(
    'hasDifferentLetters',
    (value) => !hasAcronymFormat(value) || !hasRepeatedLettersOnly(value),
    (property) =>
      `As três letras do campo ${property} não podem ser todas iguais.`,
  );
}

export function MatchesName(nameProperty: string): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'matchesName',
      target: target.constructor,
      propertyName: propertyName as string,
      constraints: [nameProperty],
      validator: {
        validate: (value: unknown, args) => {
          const name = (args!.object as Record<string, unknown>)[nameProperty];
          return (
            typeof value !== 'string' ||
            typeof name !== 'string' ||
            !hasAcronymFormat(value) ||
            acronymMatchesName(value, name)
          );
        },
        defaultMessage: (args) =>
          `O campo ${fieldLabel(args!.property)} deve usar letras que aparecem no ${fieldLabel(nameProperty)} nessa ordem, começando pela primeira letra do ${fieldLabel(nameProperty)}.`,
      },
    });
  };
}
