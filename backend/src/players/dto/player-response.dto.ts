import { ApiProperty } from '@nestjs/swagger';
import { Condition } from '../../common/enums/condition.enum';
import { Position } from '../../common/enums/position.enum';
import { PlayerResponse } from '../interfaces/player.interface';

export class PlayerResponseDto implements PlayerResponse {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'Meia Lua' })
  name!: string;

  @ApiProperty({ enum: Position, example: Position.MEI })
  position!: Position;

  @ApiProperty({ example: 85 })
  agility!: number;

  @ApiProperty({ example: 25 })
  age!: number;

  @ApiProperty({
    description: 'Condição física. Todo jogador é cadastrado APTO.',
    enum: Condition,
    example: Condition.APTO,
  })
  condition!: Condition;

  @ApiProperty({
    description: 'Valor base em moedas, calculado uma única vez no cadastro.',
    example: 40.0,
  })
  base_value!: number;

  @ApiProperty({
    description:
      'Valor de mercado em moedas, calculado a cada consulta pela condição, agilidade e idade atuais.',
    example: 40.0,
  })
  market_value!: number;

  @ApiProperty({ example: 70 })
  pace!: number;

  @ApiProperty({ example: 68 })
  shooting!: number;

  @ApiProperty({ example: 82 })
  passing!: number;

  @ApiProperty({ example: 79 })
  dribbling!: number;

  @ApiProperty({ example: 55 })
  defending!: number;

  @ApiProperty({ example: 64 })
  physical!: number;

  @ApiProperty({ example: 86 })
  potential!: number;

  @ApiProperty({
    description:
      'Overall calculado a cada consulta pelos atributos e pela posição atual.',
    example: 75,
  })
  overall!: number;

  @ApiProperty({
    description: 'Clube atual do jogador; nulo quando está livre.',
    type: Number,
    nullable: true,
    example: null,
  })
  club_id!: number | null;
}
