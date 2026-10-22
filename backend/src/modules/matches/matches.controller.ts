import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../../app.setup';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { ApiTag } from '../../docs/swagger.setup';
import { CreateMatchDto } from './dto/create-match.dto';
import { ListMatchesQueryDto } from './dto/list-matches-query.dto';
import {
  MatchDetailsResponseDto,
  MatchResponseDto,
} from './dto/match-response.dto';
import {
  MatchDetailsResponse,
  MatchResponse,
} from './interfaces/match.interface';
import { MatchesService } from './matches.service';

@ApiTags(ApiTag.LEAGUE)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({
    summary: 'Joga uma partida',
    description:
      'Os 5 titulares de cada clube disputam 6 duelos, sem sorteio: o mandante ataca nos duelos 1 a 3 e o visitante nos 4 a 6. A partida grava o placar, as formações e os duelos com os dados do momento, e não muda o caixa, a escalação nem os jogadores.',
  })
  @ApiCreatedResponse({
    description: 'Partida jogada.',
    type: MatchDetailsResponseDto,
    headers: {
      Location: {
        description: 'Caminho da partida criada.',
        schema: { type: 'string', example: '/api/v1/matches/1' },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'home_club_id ou away_club_id ausentes ou inválidos, ou os dois iguais.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Clube inexistente.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Mandante ou visitante sem a escalação completa.',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateMatchDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchDetailsResponse> {
    const match = await this.matchesService.create(dto);
    response.location(`/${API_PREFIX}/matches/${match.id}`);
    return match;
  }

  @Get()
  @ApiOperation({
    summary: 'Lista as partidas',
    description:
      'Partidas sem os duelos, da mais recente para a mais antiga; no mesmo instante, maior id primeiro.',
  })
  @ApiOkResponse({ type: [MatchResponseDto] })
  @ApiBadRequestResponse({
    description: 'club_id inválido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Clube inexistente.',
    type: ErrorResponseDto,
  })
  list(@Query() query: ListMatchesQueryDto): Promise<MatchResponse[]> {
    return this.matchesService.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta uma partida',
    description:
      'Partida com os 6 duelos na ordem em que foram disputados, com os dados gravados no momento da partida.',
  })
  @ApiParam({ name: 'id', description: 'Id da partida.', example: 1 })
  @ApiOkResponse({ type: MatchDetailsResponseDto })
  @ApiNotFoundResponse({
    description: 'Partida inexistente.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<MatchDetailsResponse> {
    return this.matchesService.findOne(id);
  }
}
