import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiTag } from '../docs/swagger.setup';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { TransactionHistoryResponseDto } from './dto/transaction-history-response.dto';
import { TransactionHistoryResponse } from './interfaces/transaction.interface';
import { CSV_HEADER } from './transactions-csv';
import { TransactionsService } from './transactions.service';

const CSV_CONTENT_TYPE = 'text/csv';

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

  @Get(':id/transactions/export')
  @ApiOperation({
    summary: 'Exportar histórico de transações em CSV',
    description:
      'Mesmos filtros e mesma ordem do histórico. Separador ";", valores com 2 casas e vírgula decimal, lucro vazio quando nulo, UTF-8 sem BOM e cada linha terminada em LF. Sem transações, só a linha de cabeçalho.',
  })
  @ApiParam({ name: 'id', description: 'Id do clube.', example: 1 })
  @ApiProduces(CSV_CONTENT_TYPE)
  @ApiOkResponse({
    description: 'Arquivo CSV.',
    content: {
      [CSV_CONTENT_TYPE]: {
        schema: {
          type: 'string',
          example:
            `${CSV_HEADER}\n` +
            '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
            '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Filtro type ou player_id inválido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Clube inexistente, ou jogador inexistente ou excluído.',
    type: ErrorResponseDto,
  })
  async export(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListTransactionsQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.transactionsService.exportCsv(id, query);
    response.set('Content-Type', `${CSV_CONTENT_TYPE}; charset=utf-8`);
    return csv;
  }
}
