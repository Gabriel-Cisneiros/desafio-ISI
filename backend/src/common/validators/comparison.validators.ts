import { registerDecorator } from 'class-validator';

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
          `O campo ${args!.property} deve ser diferente de ${otherProperty}.`,
      },
    });
  };
}
