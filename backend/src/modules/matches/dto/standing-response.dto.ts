import { ApiProperty } from '@nestjs/swagger';
import { StandingResponse } from '../interfaces/standing.interface';

export class StandingResponseDto implements StandingResponse {
  @ApiProperty({
    type: 'integer',
    description: 'Posição, de 1 ao total de clubes, sem repetir.',
    example: 1,
  })
  position!: number;

  @ApiProperty({ type: 'integer', example: 2 })
  club_id!: number;

  @ApiProperty({ example: 'Delta FC' })
  club_name!: string;

  @ApiProperty({
    type: 'integer',
    description: 'Partidas jogadas.',
    example: 1,
  })
  played!: number;

  @ApiProperty({ type: 'integer', example: 1 })
  wins!: number;

  @ApiProperty({ type: 'integer', example: 0 })
  draws!: number;

  @ApiProperty({ type: 'integer', example: 0 })
  losses!: number;

  @ApiProperty({ type: 'integer', example: 2 })
  goals_for!: number;

  @ApiProperty({ type: 'integer', example: 1 })
  goals_against!: number;

  @ApiProperty({
    type: 'integer',
    description: 'goals_for - goals_against.',
    example: 1,
  })
  goal_difference!: number;

  @ApiProperty({
    type: 'integer',
    description: 'Vitória vale 3, empate 1 e derrota 0.',
    example: 3,
  })
  points!: number;
}
