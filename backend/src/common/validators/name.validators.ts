import { Transform } from 'class-transformer';
import { ValidationOptions, registerDecorator } from 'class-validator';
import { fieldLabel } from './field-labels';
import {
  countCharacters,
  countWords,
  hasControlCharacters,
  hasDigits,
  hasOnlyNameCharacters,
  normalizeName,
} from '../rules/text';

export function registerStringRule(
  name: string,
  test: (value: string) => boolean,
  message: (property: string) => string,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name,
      target: target.constructor,
      propertyName: propertyName as string,
      options,
      validator: {
        validate: (value: unknown) => typeof value !== 'string' || test(value),
        defaultMessage: (args) => message(fieldLabel(args!.property)),
      },
    });
  };
}

export function NormalizeName(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeName(value) : value,
  );
}

export function HasNoControlCharacters(
  options?: ValidationOptions,
): PropertyDecorator {
  return registerStringRule(
    'hasNoControlCharacters',
    (value) => !hasControlCharacters(value),
    (property) =>
      `O campo ${property} não pode ter tabulação, quebra de linha nem outros caracteres de controle.`,
    options,
  );
}

export function CharacterLength(
  min: number,
  max: number,
  options?: ValidationOptions,
): PropertyDecorator {
  return registerStringRule(
    'characterLength',
    (value) => {
      const length = countCharacters(value);
      return length >= min && length <= max;
    },
    (property) =>
      `O campo ${property} deve ter de ${min} a ${max} caracteres, sem contar os espaços das pontas.`,
    options,
  );
}

export function WordCount(
  min: number,
  max = Infinity,
  options?: ValidationOptions,
): PropertyDecorator {
  return registerStringRule(
    'wordCount',
    (value) => {
      const words = countWords(value);
      return words >= min && words <= max;
    },
    (property) =>
      max === Infinity
        ? `O campo ${property} deve ter pelo menos ${min} palavras.`
        : `O campo ${property} deve ter de ${min} a ${max} palavras.`,
    options,
  );
}

export function HasNoDigits(options?: ValidationOptions): PropertyDecorator {
  return registerStringRule(
    'hasNoDigits',
    (value) => !hasDigits(value),
    (property) => `O campo ${property} não pode ter números.`,
    options,
  );
}

export function HasOnlyNameCharacters(
  options?: ValidationOptions,
): PropertyDecorator {
  return registerStringRule(
    'hasOnlyNameCharacters',
    hasOnlyNameCharacters,
    (property) =>
      `O campo ${property} só pode ter letras (com ou sem acento), espaços, hífen e ponto.`,
    options,
  );
}
