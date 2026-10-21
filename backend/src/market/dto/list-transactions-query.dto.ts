import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { QUERY_INTEGER } from '../../common/validators/messages';
import { ToQueryInteger } from '../../common/validators/query.validators';
import { parseTransactionTypes } from '../transaction-filters';

export class ListTransactionsQueryDto {
  @ApiPropertyOptional({
    description:
      'Um ou mais de COMPRA e VENDA, separados por vírgula, sem espaços e sem repetição.',
    type: String,
    example: 'COMPRA,VENDA',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? (parseTransactionTypes(value) ?? value) : value,
  )
  @IsArray({
    message:
      'O parâmetro type deve ter um ou mais de COMPRA e VENDA, separados por vírgula, sem espaços e sem repetição.',
  })
  type?: TransactionType[];

  @ApiPropertyOptional({
    description: 'Só as transações desse jogador no clube.',
    example: 2,
  })
  @IsOptional()
  @ToQueryInteger()
  @IsInt({ message: QUERY_INTEGER })
  player_id?: number;
}
