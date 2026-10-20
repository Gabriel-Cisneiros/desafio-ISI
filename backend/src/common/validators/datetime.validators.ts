import { parseBrazilDateTime } from '../rules/datetime';
import { registerStringRule } from './name.validators';

export function IsBrazilDateTime(): PropertyDecorator {
  return registerStringRule(
    'isBrazilDateTime',
    (value) => parseBrazilDateTime(value) !== undefined,
    (property) =>
      `O campo ${property} deve ser uma data e hora existente no formato AAAA-MM-DDTHH:MM-03:00, como 2027-03-02T10:15-03:00.`,
  );
}
