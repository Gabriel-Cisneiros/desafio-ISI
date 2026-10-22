import { BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  INVALID_JSON_MESSAGE,
  translateJsonParseError,
} from './json-body.middleware';

describe('translateJsonParseError', () => {
  const request = {} as Request;
  const response = {} as Response;

  it('troca o erro de JSON inválido por um 400 com mensagem em português', () => {
    const next = jest.fn<void, [unknown]>();
    const parseError = Object.assign(new SyntaxError('Unexpected token'), {
      status: 400,
      type: 'entity.parse.failed',
    });

    translateJsonParseError(parseError, request, response, next);

    const error = next.mock.calls[0][0] as BadRequestException;
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error.message).toBe(INVALID_JSON_MESSAGE);
  });

  it('repassa os outros erros sem mudar', () => {
    const next = jest.fn();
    const otherError = new Error('outro erro');

    translateJsonParseError(otherError, request, response, next);

    expect(next).toHaveBeenCalledWith(otherError);
  });
});
