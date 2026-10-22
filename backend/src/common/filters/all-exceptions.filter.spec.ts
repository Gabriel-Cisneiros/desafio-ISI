import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mantém o status e a mensagem de uma exceção HTTP', () => {
    const { host, status, json } = createHost();

    filter.catch(new ConflictException('Sigla já cadastrada.'), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Sigla já cadastrada.' });
  });

  it('usa a primeira mensagem quando a exceção traz uma lista', () => {
    const { host, json } = createHost();

    filter.catch(new BadRequestException(['primeira', 'segunda']), host);

    expect(json).toHaveBeenCalledWith({ message: 'primeira' });
  });

  it('responde com a mensagem genérica a um erro de cliente que não é HttpException', () => {
    const { host, status, json } = createHost();
    const clientError = Object.assign(new Error('payload too large'), {
      status: 413,
    });

    filter.catch(clientError, host);

    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({ message: 'Requisição inválida.' });
  });

  it('responde 500 sem expor detalhes de um erro inesperado', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('falha de conexão com o banco'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      message: 'Erro interno do servidor.',
    });
  });
});
