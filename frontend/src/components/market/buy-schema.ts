import { object, string } from 'yup';
import type { BuyPlayerBody } from '@/lib/api/types/market';

export interface BuyFormValues {
  clubId: string;
  date: string;
  time: string;
}

export const EMPTY_BUY_VALUES: BuyFormValues = {
  clubId: '',
  date: '',
  time: '',
};

export const BRASILIA_OFFSET = '-03:00';

export const buySchema = object({
  clubId: string().required('Escolha o clube comprador.'),
  date: string().required('Informe a data.'),
  time: string().required('Informe a hora.'),
});

export function toBuyBody(values: BuyFormValues): BuyPlayerBody {
  return {
    club_id: Number(values.clubId),
    loyalty_until: `${values.date}T${values.time}${BRASILIA_OFFSET}`,
  };
}
