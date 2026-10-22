import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { QUERY_INTEGER } from '../../../common/validators/messages';
import { ToQueryInteger } from '../../../common/validators/query.validators';

export class ListMatchesQueryDto {
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Só as partidas em que o clube foi mandante ou visitante.',
    example: 1,
  })
  @IsOptional()
  @ToQueryInteger()
  @IsInt({ message: QUERY_INTEGER })
  club_id?: number;
}
