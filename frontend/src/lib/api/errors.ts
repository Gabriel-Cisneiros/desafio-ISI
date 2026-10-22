import { isAxiosError } from 'axios';

export const OFFLINE_MESSAGE =
  'Não foi possível falar com o servidor. Confira se a API está no ar e tente de novo.';
export const UNEXPECTED_MESSAGE = 'Algo deu errado. Tente de novo.';

function readMessage(data: unknown): string | undefined {
  if (typeof data === 'string') {
    try {
      return readMessage(JSON.parse(data));
    } catch {
      return undefined;
    }
  }
  const message = (data as { message?: unknown } | null)?.message;
  return typeof message === 'string' && message.trim() !== ''
    ? message
    : undefined;
}

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return UNEXPECTED_MESSAGE;
  }
  if (!error.response) {
    return OFFLINE_MESSAGE;
  }
  return readMessage(error.response.data) ?? UNEXPECTED_MESSAGE;
}
