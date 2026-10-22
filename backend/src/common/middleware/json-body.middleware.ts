import { BadRequestException } from '@nestjs/common';
import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
  json,
} from 'express';

export const INVALID_JSON_MESSAGE =
  'O corpo da requisição não é um JSON válido.';
const JSON_PARSE_ERROR_TYPE = 'entity.parse.failed';

export function translateJsonParseError(
  error: unknown,
  _request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const isJsonParseError =
    (error as { type?: unknown } | null)?.type === JSON_PARSE_ERROR_TYPE;
  next(
    isJsonParseError ? new BadRequestException(INVALID_JSON_MESSAGE) : error,
  );
}

export function jsonBody(): [RequestHandler, ErrorRequestHandler] {
  return [json(), translateJsonParseError];
}
