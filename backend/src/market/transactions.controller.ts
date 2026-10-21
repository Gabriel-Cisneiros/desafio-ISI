import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiTag } from '../docs/swagger.setup';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { TransactionHistoryResponseDto } from './dto/transaction-history-response.dto';
import { TransactionHistoryResponse } from './interfaces/transaction.interface';
import { TransactionsService } from './transactions.service';

@ApiTags(ApiTag.MARKET)
@Controller('clubs')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':id/transactions')
  @ApiOperation({
    summary: 'Histórico de transações do clube',
    description:
      'Compras e vendas do clube, da mais recente para a mais antiga, com os valores e o nome do jogador gravados no momento, e o summary com os totais das transações filtradas.',
  })
  @ApiParam({ name: 'id', description: 'Id do clube.', example: 1 })
  @ApiOkResponse({ type: TransactionHistoryResponseDto })
  @ApiBadRequestResponse({
    description: 'Filtro type ou player_id inválido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Clube inexistente, ou jogador inexistente ou excluído.',
    type: ErrorResponseDto,
  })
  history(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionHistoryResponse> {
    return this.transactionsService.history(id, query);
  }
}
