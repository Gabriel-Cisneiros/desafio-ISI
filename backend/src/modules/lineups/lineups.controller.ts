import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { ApiTag } from '../../docs/swagger.setup';
import { LineupResponseDto } from './dto/lineup-response.dto';
import { UpdateLineupDto } from './dto/update-lineup.dto';
import { LineupResponse } from './interfaces/lineup.interface';
import { LineupsService } from './lineups.service';

@ApiTags(ApiTag.LEAGUE)
@Controller('clubs')
export class LineupsController {
  constructor(private readonly lineupsService: LineupsService) {}

  @Put(':id/lineup')
  @ApiOperation({
    summary: 'Escala os titulares do clube',
    description:
      'Substitui a escalação inteira pela formação e pelos 5 titulares enviados. Escalar não muda o caixa. Jogador MAL_CONDICIONADO pode ser escalado.',
  })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'Id do clube.',
    example: 1,
  })
  @ApiOkResponse({ type: LineupResponseDto })
  @ApiBadRequestResponse({
    description:
      'formation ausente ou fora da lista; player_ids ausente, que não é lista, sem exatamente 5 ids, com ids repetidos ou que não são inteiros positivos.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Clube inexistente, ou jogador inexistente ou excluído.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Jogador fora do elenco do clube, jogador DOENTE, ou posições que não fecham a formação.',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateLineupDto,
  ): Promise<LineupResponse> {
    return this.lineupsService.update(id, dto);
  }

  @Get(':id/lineup')
  @ApiOperation({
    summary: 'Consulta a escalação do clube',
    description:
      'Sem escalação, formation vem null, players vazio e complete false. Se um titular saiu, formation continua a salva, players traz os que sobraram e complete vem false.',
  })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'Id do clube.',
    example: 1,
  })
  @ApiOkResponse({ type: LineupResponseDto })
  @ApiNotFoundResponse({
    description: 'Clube inexistente.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<LineupResponse> {
    return this.lineupsService.findOne(id);
  }
}
