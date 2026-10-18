import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import { PlayerResponse } from './interfaces/player.interface';
import { PlayersService } from './players.service';

@ApiTags(ApiTag.PLAYERS)
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastra um jogador',
    description:
      'O jogador nasce APTO e livre, com o valor base calculado pela API (RN06). Campos calculados ou controlados pelo sistema e campos desconhecidos são ignorados.',
  })
  @ApiCreatedResponse({
    description: 'Jogador cadastrado.',
    type: PlayerResponseDto,
    headers: {
      Location: {
        description: 'Caminho do jogador cadastrado.',
        schema: { type: 'string', example: '/api/v1/players/2' },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Corpo inválido, campo obrigatório ausente, tipo errado ou valor fora dos limites.',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreatePlayerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.playersService.create(dto);
    response.location(`/${API_PREFIX}/players/${player.id}`);
    return player;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta um jogador',
    description:
      'O valor de mercado e o overall são calculados no momento da consulta.',
  })
  @ApiParam({ name: 'id', description: 'Id do jogador.', example: 2 })
  @ApiOkResponse({ type: PlayerResponseDto })
  @ApiNotFoundResponse({
    description: 'Jogador inexistente ou excluído.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return this.playersService.findOne(id);
  }
}
