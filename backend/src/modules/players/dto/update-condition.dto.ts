import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';
import { Condition } from '../../../common/enums/condition.enum';
import { ENUM, REQUIRED } from '../../../common/validators/messages';

export class UpdateConditionDto {
  @ApiProperty({
    description:
      'Nova condição física, com as maiúsculas exatas. De DOENTE não vai direto para APTO.',
    enum: Condition,
    example: Condition.MAL_CONDICIONADO,
  })
  @IsDefined({ message: REQUIRED })
  @IsEnum(Condition, { message: ENUM })
  condition!: Condition;
}
