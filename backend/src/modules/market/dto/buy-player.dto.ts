import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsString, Min } from 'class-validator';
import { IsBrazilDateTime } from '../../../common/validators/datetime.validators';
import {
  INTEGER,
  MIN,
  REQUIRED,
  STRING,
} from '../../../common/validators/messages';

export class BuyPlayerDto {
  @ApiProperty({
    type: 'integer',
    description: 'Id do clube comprador.',
    example: 1,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  club_id!: number;

  @ApiProperty({
    description:
      'Fim da fidelidade do contrato, no horário de Brasília (AAAA-MM-DDTHH:MM-03:00). Deve ser depois do momento da compra e até 1.095 dias depois dele.',
    example: '2027-03-02T10:15-03:00',
  })
  @IsDefined({ message: REQUIRED })
  @IsString({ message: STRING })
  @IsBrazilDateTime()
  loyalty_until!: string;
}
