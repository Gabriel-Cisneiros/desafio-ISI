import { mixed, object, string } from 'yup';
import { POSITIONS, type Position } from '@/lib/api/types/enums';
import type {
  CreatePlayerBody,
  Player,
  PlayerAttributes,
  UpdatePlayerBody,
} from '@/lib/api/types/player';
import { normalizeName } from '@/lib/text';

export const ATTRIBUTE_FIELDS: {
  key: keyof PlayerAttributes;
  label: string;
}[] = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
];

export const ATTRIBUTE_RANGE = { min: 1, max: 99 };
const AGE_RANGE = { min: 16, max: 45 };
const AGILITY_RANGE = { min: 1, max: 100 };

export interface PlayerFormValues {
  name: string;
  position: Position | '';
  age: string;
  agility: string;
}

export type CreatePlayerFormValues = PlayerFormValues &
  Record<keyof PlayerAttributes | 'potential', string>;

const INTEGER_PATTERN = /^-?\d+$/;

export function parseInteger(text: string): number | undefined {
  const trimmed = text.trim();
  return INTEGER_PATTERN.test(trimmed) ? Number(trimmed) : undefined;
}

export function isInRange(
  text: string,
  { min, max }: { min: number; max: number },
): boolean {
  const value = parseInteger(text);
  return value !== undefined && value >= min && value <= max;
}

function integerField(
  required: string,
  range: { min: number; max: number },
  rangeMessage: string,
) {
  return string()
    .trim()
    .required(required)
    .matches(INTEGER_PATTERN, 'Use um número inteiro.')
    .test('range', rangeMessage, (value) => isInRange(value ?? '', range));
}

const name = string()
  .required('Informe o nome.')
  .transform(normalizeName)
  .min(3, 'Use de 3 a 100 caracteres.')
  .max(100, 'Use de 3 a 100 caracteres.')
  .test(
    'words',
    'Use pelo menos duas palavras.',
    (value) => (value ?? '').split(' ').length >= 2,
  )
  .test('digits', 'Não use números.', (value) => !/\d/.test(value ?? ''));

const position = mixed<Position | ''>()
  .required('Escolha a posição.')
  .oneOf(POSITIONS, 'Escolha a posição.');

const agility = integerField(
  'Informe a agilidade.',
  AGILITY_RANGE,
  'Use um valor de 1 a 100.',
);

const ageMessage = 'Use uma idade de 16 a 45 anos.';

function attribute(label: string) {
  return integerField(
    `Informe ${label}.`,
    ATTRIBUTE_RANGE,
    'Use um valor de 1 a 99.',
  );
}

export const createPlayerSchema = object({
  name,
  position,
  age: integerField('Informe a idade.', AGE_RANGE, ageMessage),
  agility,
  pace: attribute('a velocidade'),
  shooting: attribute('a finalização'),
  passing: attribute('o passe'),
  dribbling: attribute('o drible'),
  defending: attribute('a defesa'),
  physical: attribute('o físico'),
  potential: attribute('o potencial'),
});

export function editPlayerSchema(currentAge: number) {
  return object({
    name,
    position,
    agility,
    age: integerField('Informe a idade.', AGE_RANGE, ageMessage).test(
      'not-younger',
      `A idade não pode ser menor que a atual (${currentAge}).`,
      (value) => (parseInteger(value ?? '') ?? currentAge) >= currentAge,
    ),
  });
}

export const EMPTY_CREATE_VALUES: CreatePlayerFormValues = {
  name: '',
  position: '',
  age: '',
  agility: '',
  pace: '',
  shooting: '',
  passing: '',
  dribbling: '',
  defending: '',
  physical: '',
  potential: '',
};

export function editValues(player: Player): PlayerFormValues {
  return {
    name: player.name,
    position: player.position,
    age: String(player.age),
    agility: String(player.agility),
  };
}

export function toUpdateBody(values: PlayerFormValues): UpdatePlayerBody {
  return {
    name: normalizeName(values.name),
    position: values.position as Position,
    age: Number(values.age.trim()),
    agility: Number(values.agility.trim()),
  };
}

export function toCreateBody(values: CreatePlayerFormValues): CreatePlayerBody {
  const body = toUpdateBody(values);
  return {
    ...body,
    pace: Number(values.pace.trim()),
    shooting: Number(values.shooting.trim()),
    passing: Number(values.passing.trim()),
    dribbling: Number(values.dribbling.trim()),
    defending: Number(values.defending.trim()),
    physical: Number(values.physical.trim()),
    potential: Number(values.potential.trim()),
  };
}
