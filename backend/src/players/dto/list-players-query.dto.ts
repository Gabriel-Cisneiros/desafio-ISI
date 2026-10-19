import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Condition } from '../../common/enums/condition.enum';
import { Position } from '../../common/enums/position.enum';
import {
  QUERY_BOOLEAN,
  QUERY_DECIMAL,
  QUERY_ENUM,
  QUERY_INTEGER,
  QUERY_MAX,
  QUERY_MIN,
} from '../../common/validators/messages';
import {
  CharacterLength,
  HasNoControlCharacters,
} from '../../common/validators/name.validators';
import {
  NormalizeSearch,
  NotLessThan,
  NotTrueWith,
  ToQueryBoolean,
  ToQueryDecimal,
  ToQueryInteger,
} from '../../common/validators/query.validators';
import { PlayerSort, parsePlayerSort } from '../player-sort';

export const MAX_PAGE_LIMIT = 50;

export class ListPlayersQueryDto {
  @ApiPropertyOptional({
    description:
      'Texto procurado dentro do nome, sem diferenciar maiúsculas, minúsculas e acentos. De 2 a 100 caracteres.',
    example: 'lua',
  })
  @IsOptional()
  @NormalizeSearch()
  @HasNoControlCharacters()
  @CharacterLength(2, 100)
  search?: string;

  @ApiPropertyOptional({ enum: Position, example: Position.MEI })
  @IsOptional()
  @IsEnum(Position, { message: QUERY_ENUM })
  position?: Position;

  @ApiPropertyOptional({ enum: Condition, example: Condition.APTO })
  @IsOptional()
  @IsEnum(Condition, { message: QUERY_ENUM })
  condition?: Condition;

  @ApiPropertyOptional({
    description:
      'true: só jogadores livres; false: só os que têm clube. free=true não pode ser usado junto com club_id.',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @ToQueryBoolean()
  @IsBoolean({ message: QUERY_BOOLEAN })
  @NotTrueWith('club_id')
  free?: boolean;

  @ApiPropertyOptional({
    description: 'Só os jogadores do elenco desse clube.',
    example: 1,
  })
  @IsOptional()
  @ToQueryInteger()
  @IsInt({ message: QUERY_INTEGER })
  club_id?: number;

  @ApiPropertyOptional({ minimum: 16, maximum: 45, example: 18 })
  @IsOptional()
  @ToQueryInteger()
  @IsInt({ message: QUERY_INTEGER })
  @Min(16, { message: QUERY_MIN })
  @Max(45, { message: QUERY_MAX })
  min_age?: number;

  @ApiPropertyOptional({ minimum: 16, maximum: 45, example: 30 })
  @IsOptional()
  @ToQueryInteger()
  @IsInt({ message: QUERY_INTEGER })
  @Min(16, { message: QUERY_MIN })
  @Max(45, { message: QUERY_MAX })
  @NotLessThan('min_age')
  max_age?: number;

  @ApiPropertyOptional({
    description: 'Valor de mercado mínimo, de 0 a 550, com até 2 casas.',
    minimum: 0,
    maximum: 550,
    example: 10.5,
  })
  @IsOptional()
  @ToQueryDecimal()
  @IsNumber({}, { message: QUERY_DECIMAL })
  @Min(0, { message: QUERY_MIN })
  @Max(550, { message: QUERY_MAX })
  min_value?: number;

  @ApiPropertyOptional({
    description: 'Valor de mercado máximo, de 0 a 550, com até 2 casas.',
    minimum: 0,
    maximum: 550,
    example: 100,
  })
  @IsOptional()
  @ToQueryDecimal()
  @IsNumber({}, { message: QUERY_DECIMAL })
  @Min(0, { message: QUERY_MIN })
  @Max(550, { message: QUERY_MAX })
  @NotLessThan('min_value')
  max_value?: number;

  @ApiPropertyOptional({
    description: `Até dois critérios separados por vírgula, sem espaços e sem repetir o campo: ${Object.values(PlayerSort).join(', ')}. O empate final é desfeito pelo nome e depois pelo id.`,
    type: String,
    example: 'value_desc,name',
    default: PlayerSort.NAME,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? (parsePlayerSort(value) ?? value) : value,
  )
  @IsArray({
    message: `O parâmetro sort deve ter até dois destes valores, separados por vírgula, sem espaços e sem repetir o campo: ${Object.values(PlayerSort).join(', ')}.`,
  })
  sort?: PlayerSort[];

  @ApiPropertyOptional({ minimum: 1, default: 1, example: 1 })
  @IsOptional()
  @ToQueryInteger()
  @IsInt({ message: QUERY_INTEGER })
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_PAGE_LIMIT,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @ToQueryInteger()
  @IsInt({ message: QUERY_INTEGER })
  @Max(MAX_PAGE_LIMIT, { message: QUERY_MAX })
  limit?: number;
}
