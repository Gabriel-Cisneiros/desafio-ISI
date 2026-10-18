import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { IsInt, IsString } from 'class-validator';
import { ApiValidationPipe } from './api-validation.pipe';

class SampleDto {
  @IsString()
  name!: string;

  @IsInt()
  age!: number;
}

describe('ApiValidationPipe', () => {
  const pipe = new ApiValidationPipe();
  const bodyMetadata: ArgumentMetadata = { type: 'body', metatype: SampleDto };

  it.each([[[]], [null], [undefined], ['x'], [10]])(
    'recusa o corpo %p, que não é um objeto JSON',
    async (body) => {
      await expect(pipe.transform(body, bodyMetadata)).rejects.toThrow(
        BadRequestException,
      );
    },
  );

  it('aceita um corpo válido', async () => {
    await expect(
      pipe.transform({ name: 'Meia Lua', age: 25 }, bodyMetadata),
    ).resolves.toEqual({ name: 'Meia Lua', age: 25 });
  });

  it('ignora campos que não pertencem ao DTO', async () => {
    const result: unknown = await pipe.transform(
      { name: 'Meia Lua', age: 25, base_value: 999 },
      bodyMetadata,
    );

    expect(result).toEqual({ name: 'Meia Lua', age: 25 });
  });

  it.each([
    ['número enviado como texto', { name: 'Meia Lua', age: '25' }],
    ['inteiro com parte fracionária', { name: 'Meia Lua', age: 25.5 }],
    ['campo obrigatório ausente', { name: 'Meia Lua' }],
    ['campo obrigatório nulo', { name: 'Meia Lua', age: null }],
  ])('recusa %s', async (_description, body) => {
    await expect(pipe.transform(body, bodyMetadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('devolve uma única mensagem em texto', async () => {
    const error: unknown = await pipe
      .transform({}, bodyMetadata)
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(BadRequestException);
    expect(typeof (error as BadRequestException).message).toBe('string');
    expect((error as BadRequestException).message).not.toBe('');
  });

  it.each(['01', '1e3', 'abc'])(
    'não converte o parâmetro de rota %p para número',
    async (value) => {
      await expect(
        pipe.transform(value, { type: 'param', metatype: Number, data: 'id' }),
      ).resolves.toBe(value);
    },
  );
});
