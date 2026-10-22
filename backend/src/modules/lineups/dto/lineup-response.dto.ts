import { ApiProperty } from '@nestjs/swagger';
import { Formation } from '../../../common/enums/formation.enum';
import { PlayerResponseDto } from '../../players/dto/player-response.dto';
import { LineupResponse } from '../interfaces/lineup.interface';

export class LineupResponseDto implements LineupResponse {
  @ApiProperty({ type: 'integer', example: 1 })
  club_id!: number;

  @ApiProperty({
    description:
      'Formação salva; null enquanto o clube não escalou. Continua a mesma quando um titular sai.',
    enum: Formation,
    nullable: true,
    example: Formation.F2_1_1,
  })
  formation!: Formation | null;

  @ApiProperty({
    description:
      'true só com os 5 titulares. Titular vendido ou que passou a DOENTE sai da escalação, e o clube só joga depois de escalar de novo.',
    example: true,
  })
  complete!: boolean;

  @ApiProperty({
    description: 'Titulares na ordem do elenco: posição, nome e id.',
    type: [PlayerResponseDto],
  })
  players!: PlayerResponseDto[];
}
