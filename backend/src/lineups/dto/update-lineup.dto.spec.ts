import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ApiValidationPipe } from '../../common/pipes/api-validation.pipe';
import { UpdateLineupDto } from './update-lineup.dto';

describe('UpdateLineupDto', () => {
  const pipe = new ApiValidationPipe();
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UpdateLineupDto,
  };

  const parse = (body: Record<string, unknown>) =>
    pipe.transform(body, metadata) as Promise<UpdateLineupDto>;

  async function messageFor(body: Record<string, unknown>) {
    const error = await parse(body).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BadRequestException);
    return (error as BadRequestException).message;
  }

  it('aceita a formação e os 5 ids, ignorando campos extras', async () => {
    await expect(
      parse({ formation: '2-1-1', player_ids: [5, 4, 3, 2, 1], cash: 10 }),
    ).resolves.toEqual({ formation: '2-1-1', player_ids: [5, 4, 3, 2, 1] });
  });

  it.each([
    ['formação ausente', { player_ids: [1, 2, 3, 4, 5] }],
    ['formação nula', { formation: null, player_ids: [1, 2, 3, 4, 5] }],
    [
      'formação fora da lista',
      { formation: '4-0', player_ids: [1, 2, 3, 4, 5] },
    ],
    ['formação como número', { formation: 211, player_ids: [1, 2, 3, 4, 5] }],
    ['player_ids ausente', { formation: '2-1-1' }],
    ['player_ids que não é lista', { formation: '2-1-1', player_ids: 1 }],
    ['quatro ids', { formation: '2-1-1', player_ids: [1, 2, 3, 4] }],
    ['seis ids', { formation: '2-1-1', player_ids: [1, 2, 3, 4, 5, 6] }],
    ['ids repetidos', { formation: '2-1-1', player_ids: [1, 1, 3, 4, 5] }],
    ['id em texto', { formation: '2-1-1', player_ids: [1, 2, 3, 4, '5'] }],
    ['id fracionário', { formation: '2-1-1', player_ids: [1, 2, 3, 4, 5.5] }],
    ['id zero', { formation: '2-1-1', player_ids: [0, 2, 3, 4, 5] }],
    ['id nulo', { formation: '2-1-1', player_ids: [null, 2, 3, 4, 5] }],
  ])('recusa %s', async (_, body) => {
    await expect(parse(body)).rejects.toThrow(BadRequestException);
  });

  it('explica a lista que não é lista', async () => {
    await expect(
      messageFor({ formation: '2-1-1', player_ids: 'abc' }),
    ).resolves.toBe('O campo player_ids deve ser uma lista.');
  });

  it('explica o tamanho da lista', async () => {
    await expect(
      messageFor({ formation: '2-1-1', player_ids: [1, 2] }),
    ).resolves.toBe('O campo player_ids deve ter exatamente 5 itens.');
  });
});
