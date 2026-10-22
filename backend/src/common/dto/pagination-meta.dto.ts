import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '../interfaces/paginated.interface';

export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ type: 'integer', example: 1 })
  page!: number;

  @ApiProperty({ type: 'integer', example: 10 })
  limit!: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de itens que atendem à busca e aos filtros.',
    example: 23,
  })
  total_items!: number;

  @ApiProperty({
    type: 'integer',
    description: 'total_items ÷ limit, arredondado para cima; 0 sem itens.',
    example: 3,
  })
  total_pages!: number;
}
