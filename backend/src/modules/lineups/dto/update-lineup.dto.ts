import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Formation } from '../../../common/enums/formation.enum';
import { LINEUP_SIZE } from '../../../common/rules/lineup';
import {
  ARRAY,
  ARRAY_SIZE,
  ARRAY_UNIQUE,
  EACH_POSITIVE_INTEGER,
  ENUM,
  REQUIRED,
} from '../../../common/validators/messages';

export class UpdateLineupDto {
  @ApiProperty({
    description:
      'Formação dos 4 jogadores de linha, de trás para frente: defesa (ZAG ou LAT), meio (MEI) e ataque (ATA). O goleiro fica fora da conta.',
    enum: Formation,
    example: Formation.F2_1_1,
  })
  @IsDefined({ message: REQUIRED })
  @IsEnum(Formation, { message: ENUM })
  formation!: Formation;

  @ApiProperty({
    description:
      'Ids dos 5 titulares, em qualquer ordem: 1 GOL e os jogadores de linha da formação, todos do elenco do clube e nenhum DOENTE.',
    type: 'integer',
    isArray: true,
    example: [34, 31, 30, 33, 32],
  })
  @IsDefined({ message: REQUIRED })
  @IsArray({ message: ARRAY })
  @ArrayMinSize(LINEUP_SIZE, { message: ARRAY_SIZE })
  @ArrayMaxSize(LINEUP_SIZE, { message: ARRAY_SIZE })
  @ArrayUnique({ message: ARRAY_UNIQUE })
  @IsInt({ each: true, message: EACH_POSITIVE_INTEGER })
  @Min(1, { each: true, message: EACH_POSITIVE_INTEGER })
  player_ids!: number[];
}
