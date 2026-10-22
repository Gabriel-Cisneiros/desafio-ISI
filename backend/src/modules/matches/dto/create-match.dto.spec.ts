import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ApiValidationPipe } from '../../../common/pipes/api-validation.pipe';
import { CreateMatchDto } from './create-match.dto';

describe('CreateMatchDto', () => {
  const pipe = new ApiValidationPipe();
  const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMatchDto };

  const parse = (body: Record<string, unknown>) =>
    pipe.transform(body, metadata) as Promise<CreateMatchDto>;

  it('aceita mandante e visitante diferentes', async () => {
    await expect(parse({ home_club_id: 1, away_club_id: 2 })).resolves.toEqual({
      home_club_id: 1,
      away_club_id: 2,
    });
  });

  it.each([
    ['mandante ausente', { away_club_id: 2 }],
    ['visitante nulo', { home_club_id: 1, away_club_id: null }],
    ['id em texto', { home_club_id: '1', away_club_id: 2 }],
    ['id fracionário', { home_club_id: 1, away_club_id: 2.5 }],
    ['id zero', { home_club_id: 0, away_club_id: 2 }],
    ['mandante igual ao visitante', { home_club_id: 1, away_club_id: 1 }],
  ])('recusa %s', async (_, body) => {
    await expect(parse(body)).rejects.toThrow(BadRequestException);
  });

  it('explica mandante igual ao visitante', async () => {
    const error = (await parse({ home_club_id: 3, away_club_id: 3 }).catch(
      (caught: unknown) => caught,
    )) as BadRequestException;

    expect(error.message).toBe(
      'O campo away_club_id deve ser diferente de home_club_id.',
    );
  });
});
