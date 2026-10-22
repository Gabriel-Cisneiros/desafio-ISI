import { ApiProperty } from '@nestjs/swagger';
import { StandingResponse } from '../interfaces/standing.interface';

export class StandingResponseDto implements StandingResponse {
  @ApiProperty({
    description: 'Posição, de 1 ao total de clubes, sem repetir.',
    example: 1,
  })
  position!: number;

  @ApiProperty({ example: 2 })
  club_id!: number;

  @ApiProperty({ example: 'Delta FC' })
  club_name!: string;

  @ApiProperty({ description: 'Partidas jogadas.', example: 1 })
  played!: number;

  @ApiProperty({ example: 1 })
  wins!: number;

  @ApiProperty({ example: 0 })
  draws!: number;

  @ApiProperty({ example: 0 })
  losses!: number;

  @ApiProperty({ example: 2 })
  goals_for!: number;

  @ApiProperty({ example: 1 })
  goals_against!: number;

  @ApiProperty({ description: 'goals_for - goals_against.', example: 1 })
  goal_difference!: number;

  @ApiProperty({
    description: 'Vitória vale 3, empate 1 e derrota 0.',
    example: 3,
  })
  points!: number;
}
