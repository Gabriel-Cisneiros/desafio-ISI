import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus } from '../../common/enums/contract-status.enum';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import {
  ContractSummary,
  MarketOperationResponse,
  TransactionResponse,
} from '../interfaces/transaction.interface';

export class TransactionResponseDto implements TransactionResponse {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 1 })
  club_id!: number;

  @ApiProperty({ example: 2 })
  player_id!: number;

  @ApiProperty({
    description: 'Nome do jogador no momento da transação.',
    example: 'Meia Lua',
  })
  player_name!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.COMPRA })
  type!: TransactionType;

  @ApiProperty({
    description: 'Valor de mercado no momento da transação.',
    example: 37.0,
  })
  value!: number;

  @ApiProperty({
    description: 'Taxa de compra ou comissão de venda.',
    example: 1.85,
  })
  fee!: number;

  @ApiProperty({
    description: 'Multa de rescisão; 0,00 na compra.',
    example: 0,
  })
  penalty!: number;

  @ApiProperty({
    description: 'Lucro da venda; nulo na compra.',
    type: Number,
    nullable: true,
    example: null,
  })
  profit!: number | null;

  @ApiProperty({
    description: 'Variação do caixa do clube: negativa na compra.',
    example: -38.85,
  })
  cash_change!: number;

  @ApiProperty({ example: '2026-11-02T10:15:00-03:00' })
  created_at!: string;
}

export class ContractSummaryDto implements ContractSummary {
  @ApiProperty({ description: 'Valor de compra, sem a taxa.', example: 37.0 })
  purchase_value!: number;

  @ApiProperty({ example: '2027-03-02T10:15:00-03:00' })
  loyalty_until!: string;

  @ApiProperty({ enum: ContractStatus, example: ContractStatus.ATIVO })
  status!: ContractStatus;
}

export class MarketOperationResponseDto
  extends TransactionResponseDto
  implements MarketOperationResponse
{
  @ApiProperty({ type: ContractSummaryDto })
  contract!: ContractSummaryDto;

  @ApiProperty({
    description: 'Caixa do clube depois da operação.',
    example: 261.15,
  })
  club_cash!: number;
}
