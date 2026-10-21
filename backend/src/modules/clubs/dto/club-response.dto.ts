import { ApiProperty } from '@nestjs/swagger';
import { PlayerResponseDto } from '../../players/dto/player-response.dto';
import {
  ClubDetailsResponse,
  ClubResponse,
  SquadContract,
  SquadPlayerResponse,
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

export class SquadContractDto implements SquadContract {
  @ApiProperty({ description: 'Valor de compra, sem a taxa.', example: 37.0 })
  purchase_value!: number;

  @ApiProperty({ example: '2027-03-02T10:15:00-03:00' })
  loyalty_until!: string;

  @ApiProperty({
    description:
      'Dias até o fim da fidelidade, com fração arredondada para cima; 0 se já passou.',
    example: 120,
  })
  remaining_days!: number;

  @ApiProperty({
    description:
      'Percentual de multa se o jogador fosse vendido agora: 0, 5, 10 ou 20.',
    example: 10,
  })
  penalty_rate!: number;
}

export class SquadPlayerResponseDto
  extends PlayerResponseDto
  implements SquadPlayerResponse
{
  @ApiProperty({
    description: 'Contrato ativo do jogador com o clube.',
    type: SquadContractDto,
    nullable: true,
  })
  contract!: SquadContractDto | null;
}

export class ClubDetailsResponseDto
  extends ClubResponseDto
  implements ClubDetailsResponse
{
  @ApiProperty({
    description:
      'Elenco ordenado por posição (GOL, ZAG, LAT, MEI, ATA), nome e id.',
    type: [SquadPlayerResponseDto],
  })
  players!: SquadPlayerResponseDto[];
}
