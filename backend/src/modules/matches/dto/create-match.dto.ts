import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';
import { DifferentFrom } from '../../../common/validators/comparison.validators';
import { INTEGER, MIN, REQUIRED } from '../../../common/validators/messages';

export class CreateMatchDto {
  @ApiProperty({ description: 'Id do clube mandante.', example: 1 })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  home_club_id!: number;

  @ApiProperty({
    description: 'Id do clube visitante, diferente do mandante.',
    example: 2,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @DifferentFrom('home_club_id')
  away_club_id!: number;
}
