import { ApiProperty } from '@nestjs/swagger';
import { PlayerResponseDto } from '../../players/dto/player-response.dto';
import {
  ClubDetailsResponse,
  ClubResponse,
} from '../interfaces/club.interface';

export class ClubResponseDto implements ClubResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Águias FC' })
  name!: string;

  @ApiProperty({ example: 'AGU' })
  acronym!: string;

  @ApiProperty({
    description:
      'Caixa em moedas. Começa em 300,00 e só muda por compras e vendas.',
    example: 261.15,
  })
  cash!: number;

  @ApiProperty({
    description:
      'Soma dos valores de mercado dos jogadores do clube, calculada a cada consulta.',
    example: 37.0,
  })
  squad_value!: number;

  @ApiProperty({
    description:
      'Patrimônio: caixa + valor do elenco, calculado a cada consulta.',
    example: 298.15,
  })
  net_worth!: number;
}

export class ClubDetailsResponseDto
  extends ClubResponseDto
  implements ClubDetailsResponse
{
  @ApiProperty({
    description:
      'Elenco ordenado por posição (GOL, ZAG, LAT, MEI, ATA), nome e id.',
    type: [PlayerResponseDto],
  })
  players!: PlayerResponseDto[];
}
