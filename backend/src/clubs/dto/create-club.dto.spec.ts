import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ApiValidationPipe } from '../../common/pipes/api-validation.pipe';
import { CreateClubDto } from './create-club.dto';

describe('CreateClubDto', () => {
  const pipe = new ApiValidationPipe();
  const metadata: ArgumentMetadata = { type: 'body', metatype: CreateClubDto };

  const parse = (body: Record<string, unknown>) =>
    pipe.transform(body, metadata) as Promise<CreateClubDto>;

  async function messageFor(body: Record<string, unknown>) {
    const error = await parse(body).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BadRequestException);
    return (error as BadRequestException).message;
  }

  it('normaliza o nome e aceita a sigla', async () => {
    await expect(
      parse({ name: '  Águias   FC ', acronym: 'AGU' }),
    ).resolves.toEqual({ name: 'Águias FC', acronym: 'AGU' });
  });

  it.each([
    ['nome com uma palavra', { name: 'Águias', acronym: 'AGU' }],
    ['nome com seis palavras', { name: 'A B C D E F', acronym: 'ABC' }],
    [
      'nome com 61 caracteres',
      { name: `Clube ${'a'.repeat(55)}`, acronym: 'CLU' },
    ],
    ['nome com número', { name: 'Clube 10', acronym: 'CLU' }],
    ['nome com caractere especial', { name: 'Clube & Cia', acronym: 'CLC' }],
    ['sigla ausente', { name: 'Águias FC' }],
    ['sigla em minúsculas', { name: 'Águias FC', acronym: 'agu' }],
    ['sigla com acento', { name: 'Águias FC', acronym: 'ÁGU' }],
  ])('recusa %s', async (_, body) => {
    await expect(parse(body)).rejects.toThrow(BadRequestException);
  });

  it('explica a sigla com as três letras iguais', async () => {
    expect(await messageFor({ name: 'Aaa Clube', acronym: 'AAA' })).toBe(
      'As três letras do campo acronym não podem ser todas iguais.',
    );
  });

  it('explica a sigla que não corresponde ao nome', async () => {
    expect(await messageFor({ name: 'Águias FC', acronym: 'GUA' })).toBe(
      'O campo acronym deve usar letras que aparecem no name nessa ordem, começando pela primeira letra do name.',
    );
  });

  it('explica a sigla fora do formato antes de comparar com o nome', async () => {
    expect(await messageFor({ name: 'Águias FC', acronym: 'xyz' })).toBe(
      'O campo acronym deve ter exatamente 3 letras de A a Z, maiúsculas e sem acento.',
    );
  });
});
