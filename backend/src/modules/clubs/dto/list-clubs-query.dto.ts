import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { QUERY_ENUM } from '../../../common/validators/messages';
import { ClubSort } from '../utils/club-sort';

export class ListClubsQueryDto {
  @ApiPropertyOptional({
    description:
      'Um só valor. name: ordem alfabética; net_worth_asc e net_worth_desc: patrimônio calculado. O empate é desfeito pelo nome e depois pelo id.',
    enum: ClubSort,
    default: ClubSort.NAME,
  })
  @IsOptional()
  @IsEnum(ClubSort, { message: QUERY_ENUM })
  sort?: ClubSort;
}
