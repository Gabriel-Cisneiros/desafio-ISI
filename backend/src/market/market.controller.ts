import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiTag } from '../docs/swagger.setup';
import { BuyPlayerDto } from './dto/buy-player.dto';
import { MarketOperationResponseDto } from './dto/market-operation-response.dto';
import { MarketOperationResponse } from './interfaces/transaction.interface';
import { MarketService } from './market.service';

@ApiTags(ApiTag.MARKET)
@Controller('players')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compra um jogador livre',
    description:
      'O preço é o valor de mercado no momento, mais a taxa de 5% quando o valor passa de 30,00. O custo total não pode passar de 50% do caixa. Numa única operação, desconta o caixa, coloca o jogador no elenco, cria o contrato ATIVO e grava a transação COMPRA.',
  })
  @ApiParam({ name: 'id', description: 'Id do jogador.', example: 2 })
  @ApiOkResponse({ type: MarketOperationResponseDto })
  @ApiBadRequestResponse({
    description:
      'club_id ou loyalty_until ausentes ou inválidos; fim da fidelidade que não é futuro ou passa de 1.095 dias.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Jogador inexistente ou excluído, ou clube inexistente.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Jogador que não está livre, custo acima de 50% do caixa, elenco com 12 jogadores ou recompra pelo clube que vendeu o jogador.',
    type: ErrorResponseDto,
  })
  buy(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: BuyPlayerDto,
  ): Promise<MarketOperationResponse> {
    return this.marketService.buy(id, dto);
  }
}
