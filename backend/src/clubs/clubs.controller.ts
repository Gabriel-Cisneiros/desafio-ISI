import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
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
import { API_PREFIX } from '../app.setup';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiTag } from '../docs/swagger.setup';
import { ClubsService } from './clubs.service';
import {
  ClubDetailsResponseDto,
  ClubResponseDto,
} from './dto/club-response.dto';
import { CreateClubDto } from './dto/create-club.dto';
import { ClubDetailsResponse, ClubResponse } from './interfaces/club.interface';

@ApiTags(ApiTag.CLUBS)
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um clube',
    description:
      'O clube nasce com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes.',
  })
  @ApiCreatedResponse({
    description: 'Clube criado.',
    type: ClubResponseDto,
    headers: {
      Location: {
        description: 'Caminho do clube criado.',
        schema: { type: 'string', example: '/api/v1/clubs/1' },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Nome fora do tamanho ou do formato; sigla fora do formato ou que não corresponde ao nome.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Nome ou sigla já cadastrados, ou limite de 20 clubes atingido.',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.clubsService.create(dto);
    response.location(`/${API_PREFIX}/clubs/${club.id}`);
    return club;
  }

  @Get()
  @ApiOperation({
    summary: 'Lista os clubes',
    description:
      'Clubes em ordem alfabética pelo nome, com empate desfeito pelo id, sem o elenco.',
  })
  @ApiOkResponse({ type: [ClubResponseDto] })
  list(): Promise<ClubResponse[]> {
    return this.clubsService.list();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta um clube',
    description:
      'Clube com o elenco ordenado por posição, nome e id. Valor do elenco e patrimônio são calculados no momento da consulta.',
  })
  @ApiParam({ name: 'id', description: 'Id do clube.', example: 1 })
  @ApiOkResponse({ type: ClubDetailsResponseDto })
  @ApiNotFoundResponse({
    description: 'Clube inexistente.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<ClubDetailsResponse> {
    return this.clubsService.findOne(id);
  }
}
