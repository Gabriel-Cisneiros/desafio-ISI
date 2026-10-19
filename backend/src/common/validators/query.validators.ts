import { Transform } from 'class-transformer';
import { registerDecorator } from 'class-validator';
import { normalizeName } from '../rules/text';

const INTEGER_PATTERN = /^[1-9]\d*$/;
const DECIMAL_PATTERN = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

function convertWhen(
  pattern: RegExp,
  convert: (value: string) => unknown,
): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && pattern.test(value) ? convert(value) : value,
  );
}

export function ToQueryInteger(): PropertyDecorator {
  return convertWhen(INTEGER_PATTERN, Number);
}

export function ToQueryDecimal(): PropertyDecorator {
  return convertWhen(DECIMAL_PATTERN, Number);
}

export function ToQueryBoolean(): PropertyDecorator {
  return convertWhen(/^(true|false)$/, (value) => value === 'true');
}

export function NormalizeSearch(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? (normalizeName(value) ?? '') : value,
  );
}

export function NotTrueWith(otherProperty: string): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'notTrueWith',
      target: target.constructor,
      propertyName: propertyName as string,
      constraints: [otherProperty],
      validator: {
        validate: (value: unknown, args) =>
          value !== true ||
          (args!.object as Record<string, unknown>)[otherProperty] ===
            undefined,
        defaultMessage: (args) =>
          `O parâmetro ${args!.property}=true não pode ser usado junto com ${otherProperty}.`,
      },
    });
  };
}

export function NotLessThan(minProperty: string): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'notLessThan',
      target: target.constructor,
      propertyName: propertyName as string,
      constraints: [minProperty],
      validator: {
        validate: (value: unknown, args) => {
          const min = (args!.object as Record<string, unknown>)[minProperty];
          return (
            typeof value !== 'number' || typeof min !== 'number' || value >= min
          );
        },
        defaultMessage: (args) =>
          `O parâmetro ${args!.property} não pode ser menor que ${minProperty}.`,
      },
    });
  };
}
