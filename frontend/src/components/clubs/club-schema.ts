import { object, string } from 'yup';
import type { CreateClubBody } from '@/lib/api/types/club';
import { normalizeName } from '@/lib/text';

export type ClubFormValues = CreateClubBody;

export const EMPTY_CLUB_VALUES: ClubFormValues = { name: '', acronym: '' };

export const clubSchema = object({
  name: string()
    .required('Informe o nome.')
    .transform(normalizeName)
    .min(3, 'Use de 3 a 60 caracteres.')
    .max(60, 'Use de 3 a 60 caracteres.')
    .matches(/^[\p{L}\p{M} .-]+$/u, 'Use só letras, espaços, hífen e ponto.')
    .test('words', 'Use de 2 a 5 palavras.', (value) => {
      const words = (value ?? '')
        .split(' ')
        .filter((part) => /\p{L}/u.test(part)).length;
      return words >= 2 && words <= 5;
    }),
  acronym: string()
    .required('Informe a sigla.')
    .matches(/^[A-Z]{3}$/, 'Use 3 letras de A a Z, sem acento.')
    .test(
      'different-letters',
      'As três letras não podem ser todas iguais.',
      (value) => new Set(value).size > 1,
    ),
});

export function toClubBody(values: ClubFormValues): CreateClubBody {
  return { name: normalizeName(values.name), acronym: values.acronym };
}
