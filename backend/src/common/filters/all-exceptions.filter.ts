import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const INTERNAL_ERROR_MESSAGE = 'Erro interno do servidor.';
const INVALID_REQUEST_MESSAGE = 'Requisição inválida.';
const INVALID_JSON_MESSAGE = 'O corpo da requisição não é um JSON válido.';
const JSON_PARSE_ERROR_TYPE = 'entity.parse.failed';

interface ErrorResponse {
  status: number;
  message: string;
}

function readHttpExceptionMessage(exception: HttpException): string {
  const body = exception.getResponse();
  const rawMessage: unknown =
    typeof body === 'string' ? body : (body as { message?: unknown }).message;
  const message: unknown = Array.isArray(rawMessage)
    ? rawMessage[0]
    : rawMessage;

  return typeof message === 'string' && message.trim() !== ''
    ? message
    : exception.message || INVALID_REQUEST_MESSAGE;
}

function readClientErrorStatus(exception: unknown): number | undefined {
  const { status, statusCode } = (exception ?? {}) as {
    status?: unknown;
    statusCode?: unknown;
  };
  const code = typeof status === 'number' ? status : statusCode;

  return typeof code === 'number' && code >= 400 && code < 500
    ? code
    : undefined;
}

function toErrorResponse(exception: unknown): ErrorResponse | undefined {
  if (exception instanceof HttpException) {
    return {
      status: exception.getStatus(),
      message: readHttpExceptionMessage(exception),
    };
  }

  const status = readClientErrorStatus(exception);
  if (status === undefined) {
    return undefined;
  }

  const isJsonParseError =
    (exception as { type?: unknown }).type === JSON_PARSE_ERROR_TYPE;

  return {
    status,
    message: isJsonParseError ? INVALID_JSON_MESSAGE : INVALID_REQUEST_MESSAGE,
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const errorResponse = toErrorResponse(exception);

    if (errorResponse) {
      response
        .status(errorResponse.status)
        .json({ message: errorResponse.message });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: INTERNAL_ERROR_MESSAGE });
  }
}
