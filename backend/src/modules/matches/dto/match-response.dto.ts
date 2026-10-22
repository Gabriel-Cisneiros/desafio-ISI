import { ApiProperty } from '@nestjs/swagger';
import { Condition } from '../../../common/enums/condition.enum';
import { Formation } from '../../../common/enums/formation.enum';
import { MatchResult } from '../../../common/enums/match-result.enum';
import { Position } from '../../../common/enums/position.enum';
import type { DuelAttribute } from '../../../common/rules/match';
import {
  DuelPlayer,
  DuelResponse,
  MatchDetailsResponse,
  MatchResponse,
  MatchTeam,
} from '../interfaces/match.interface';

const DUEL_ATTRIBUTES: DuelAttribute[] = [
  'shooting',
  'passing',
  'dribbling',
  'defending',
];

export class MatchTeamDto implements MatchTeam {
  @ApiProperty({ type: 'integer', example: 1 })
  club_id!: number;

  @ApiProperty({ example: 'Águias FC' })
  club_name!: string;

  @ApiProperty({
    description: 'Formação do clube no momento da partida.',
    enum: Formation,
    example: Formation.F2_1_1,
  })
  formation!: Formation;

  @ApiProperty({
    type: 'integer',
    description: 'Gols marcados, de 0 a 3.',
    example: 1,
  })
  goals!: number;
}

export class DuelPlayerDto implements DuelPlayer {
  @ApiProperty({ type: 'integer', example: 34 })
  player_id!: number;

  @ApiProperty({
    description: 'Nome do jogador no momento da partida.',
    example: 'Otto Rangel',
  })
  player_name!: string;

  @ApiProperty({ enum: Position, example: Position.ATA })
  position!: Position;

  @ApiProperty({ enum: Condition, example: Condition.APTO })
  condition!: Condition;

  @ApiProperty({
    description:
      'Atributo usado: shooting (ATA), passing (MEI) ou dribbling (ZAG e LAT) no ataque; defending na defesa.',
    enum: DUEL_ATTRIBUTES,
    example: 'shooting',
  })
  attribute!: DuelAttribute;

  @ApiProperty({
    type: 'integer',
    description:
      'Valor usado no duelo, já com o efeito da condição: MAL_CONDICIONADO joga com 15% a menos.',
    example: 75,
  })
  value!: number;
}

export class DuelResponseDto implements DuelResponse {
  @ApiProperty({
    type: 'integer',
    description:
      'Número do duelo: 1 a 3 são os ataques do mandante, 4 a 6 os do visitante.',
    example: 1,
  })
  order!: number;

  @ApiProperty({ type: 'integer', example: 1 })
  attacking_club_id!: number;

  @ApiProperty({ type: DuelPlayerDto })
  attacker!: DuelPlayerDto;

  @ApiProperty({ type: DuelPlayerDto })
  defender!: DuelPlayerDto;

  @ApiProperty({
    description: 'Gol quando o ataque é maior que a defesa.',
    example: true,
  })
  goal!: boolean;
}

export class MatchResponseDto implements MatchResponse {
  @ApiProperty({ type: 'integer', example: 1 })
  id!: number;

  @ApiProperty({ example: '2026-11-12T15:00:00-03:00' })
  played_at!: string;

  @ApiProperty({ type: MatchTeamDto })
  home!: MatchTeamDto;

  @ApiProperty({ type: MatchTeamDto })
  away!: MatchTeamDto;

  @ApiProperty({ enum: MatchResult, example: MatchResult.VISITANTE })
  result!: MatchResult;
}

export class MatchDetailsResponseDto
  extends MatchResponseDto
  implements MatchDetailsResponse
{
  @ApiProperty({
    description: 'Os 6 duelos, na ordem em que foram disputados.',
    type: [DuelResponseDto],
  })
  duels!: DuelResponseDto[];
}
