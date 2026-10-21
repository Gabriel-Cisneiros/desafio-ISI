import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionHistoryResponse,
  TransactionSummary,
} from '../interfaces/transaction.interface';
import { TransactionResponseDto } from './market-operation-response.dto';

export class TransactionSummaryDto implements TransactionSummary {
  @ApiProperty({
    description: 'Soma de value + fee das compras.',
    example: 38.85,
  })
  total_spent!: number;

  @ApiProperty({
    description: 'Soma de cash_change das vendas.',
    example: 35.7,
  })
  total_received!: number;

  @ApiProperty({
    description: 'Soma das taxas e comissões de todas as transações.',
    example: 2.15,
  })
  total_fees!: number;

  @ApiProperty({ description: 'Soma das multas das vendas.', example: 4.0 })
  total_penalties!: number;

  @ApiProperty({
    description: 'Soma dos lucros das vendas, com sinal.',
    example: 3.0,
  })
  total_profit!: number;
}

export class TransactionHistoryResponseDto implements TransactionHistoryResponse {
  @ApiProperty({
    description:
      'Transações da mais recente para a mais antiga; em empate de data e hora, id decrescente.',
    type: [TransactionResponseDto],
  })
  data!: TransactionResponseDto[];

  @ApiProperty({
    description: 'Totais das transações filtradas, com 2 casas.',
    type: TransactionSummaryDto,
  })
  summary!: TransactionSummaryDto;
}
