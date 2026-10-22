import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '../../docs/swagger.setup';
import { StandingResponseDto } from './dto/standing-response.dto';
import { StandingResponse } from './interfaces/standing.interface';
import { StandingsService } from './standings.service';

@ApiTags(ApiTag.LEAGUE)
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Classificação',
    description:
      'Todos os clubes, inclusive os que ainda não jogaram, calculada a cada consulta. Ordem: mais pontos, maior saldo de gols, mais gols marcados e nome do clube em ordem alfabética.',
  })
  @ApiOkResponse({ type: [StandingResponseDto] })
  list(): Promise<StandingResponse[]> {
    return this.standingsService.list();
  }
}
