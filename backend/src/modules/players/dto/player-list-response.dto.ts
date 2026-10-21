import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { Paginated } from '../../../common/interfaces/paginated.interface';
import { PlayerResponse } from '../interfaces/player.interface';
import { PlayerResponseDto } from './player-response.dto';

export class PlayerListResponseDto implements Paginated<PlayerResponse> {
  @ApiProperty({ type: [PlayerResponseDto] })
  data!: PlayerResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
