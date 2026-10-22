import { ValidationArguments } from 'class-validator';
import { fieldLabel } from './field-labels';

function withFieldLabel(message: string) {
  return ({ property }: ValidationArguments) =>
    message.replace('$property', fieldLabel(property));
}

export const REQUIRED = withFieldLabel('O campo $property é obrigatório.');
export const STRING = withFieldLabel('O campo $property deve ser um texto.');
export const INTEGER = withFieldLabel(
  'O campo $property deve ser um número inteiro.',
);
export const MIN = withFieldLabel(
  'O campo $property deve ser no mínimo $constraint1.',
);
export const MAX = withFieldLabel(
  'O campo $property deve ser no máximo $constraint1.',
);
export const ENUM = withFieldLabel(
  'O campo $property deve ser um destes valores, com as maiúsculas exatas: $constraint2.',
);

export const ARRAY = withFieldLabel('O campo $property deve ser uma lista.');
export const ARRAY_SIZE = withFieldLabel(
  'O campo $property deve ter exatamente $constraint1 itens.',
);
export const ARRAY_UNIQUE = withFieldLabel(
  'O campo $property não pode ter itens repetidos.',
);
export const EACH_POSITIVE_INTEGER = withFieldLabel(
  'Cada item de $property deve ser um número inteiro positivo.',
);

export const QUERY_INTEGER =
  'O parâmetro $property deve ser um número inteiro positivo, só com dígitos, sem sinal e sem zeros à esquerda.';
export const QUERY_DECIMAL =
  'O parâmetro $property deve ser um número como 10, 10.5 ou 10.55, sem sinal e sem zeros à esquerda.';
export const QUERY_BOOLEAN = 'O parâmetro $property deve ser true ou false.';
export const QUERY_MIN =
  'O parâmetro $property deve ser no mínimo $constraint1.';
export const QUERY_MAX =
  'O parâmetro $property deve ser no máximo $constraint1.';
export const QUERY_ENUM =
  'O parâmetro $property deve ser um destes valores, com as maiúsculas exatas: $constraint2.';
