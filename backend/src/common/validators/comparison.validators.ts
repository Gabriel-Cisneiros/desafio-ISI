import { registerDecorator } from 'class-validator';
import { fieldLabel } from './field-labels';

export function DifferentFrom(otherProperty: string): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'differentFrom',
      target: target.constructor,
      propertyName: propertyName as string,
      constraints: [otherProperty],
      validator: {
        validate: (value: unknown, args) =>
          value !== (args!.object as Record<string, unknown>)[otherProperty],
        defaultMessage: (args) =>
          `O campo ${fieldLabel(args!.property)} deve ser diferente de ${fieldLabel(otherProperty)}.`,
      },
    });
  };
}
