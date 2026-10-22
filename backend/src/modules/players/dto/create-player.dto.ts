import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import { Position } from '../../../common/enums/position.enum';
import {
  CharacterLength,
  HasNoControlCharacters,
  HasNoDigits,
  NormalizeName,
  WordCount,
} from '../../../common/validators/name.validators';
import {
  ENUM,
  INTEGER,
  MAX,
  MIN,
  REQUIRED,
  STRING,
} from '../../../common/validators/messages';
import {
  AgilityAllowedForAge,
  AttributesSumWithinLimit,
  PotentialMatchesAttributes,
} from '../../../common/validators/player.validators';

function attributeDescription(label: string): string {
  return `${label}, de 1 a 99. Não muda depois do cadastro. A soma dos seis atributos deve ser no máximo 480.`;
}

export class CreatePlayerDto {
  @ApiProperty({
    description:
      'Nome do jogador. Espaços das pontas são removidos e espaços repetidos viram um só. De 3 a 100 caracteres, com pelo menos duas palavras e sem números.',
    example: 'Meia Lua',
    minLength: 3,
    maxLength: 100,
  })
  @IsDefined({ message: REQUIRED })
  @IsString({ message: STRING })
  @NormalizeName()
  @HasNoControlCharacters()
  @CharacterLength(3, 100)
  @WordCount(2)
  @HasNoDigits()
  name!: string;

  @ApiProperty({
    description: 'Posição do jogador, com as maiúsculas exatas.',
    enum: Position,
    example: Position.MEI,
  })
  @IsDefined({ message: REQUIRED })
  @IsEnum(Position, { message: ENUM })
  position!: Position;

  @ApiProperty({
    type: 'integer',
    description:
      'Agilidade, de 1 a 100. Com 35 anos ou mais, no máximo 85. Altera o desconto por condição no valor de mercado.',
    example: 85,
    minimum: 1,
    maximum: 100,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(100, { message: MAX })
  @AgilityAllowedForAge()
  agility!: number;

  @ApiProperty({
    type: 'integer',
    description: 'Idade atual, de 16 a 45.',
    example: 25,
    minimum: 16,
    maximum: 45,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(16, { message: MIN })
  @Max(45, { message: MAX })
  age!: number;

  @ApiProperty({
    type: 'integer',
    description: attributeDescription('Velocidade'),
    example: 70,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(99, { message: MAX })
  pace!: number;

  @ApiProperty({
    type: 'integer',
    description: attributeDescription('Finalização'),
    example: 68,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(99, { message: MAX })
  shooting!: number;

  @ApiProperty({
    type: 'integer',
    description: attributeDescription('Passe'),
    example: 82,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(99, { message: MAX })
  passing!: number;

  @ApiProperty({
    type: 'integer',
    description: attributeDescription('Drible'),
    example: 79,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(99, { message: MAX })
  dribbling!: number;

  @ApiProperty({
    type: 'integer',
    description: attributeDescription('Defesa'),
    example: 55,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(99, { message: MAX })
  defending!: number;

  @ApiProperty({
    type: 'integer',
    description: attributeDescription('Físico'),
    example: 64,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(99, { message: MAX })
  @AttributesSumWithinLimit()
  physical!: number;

  @ApiProperty({
    type: 'integer',
    description:
      'Potencial, de 1 a 99 e maior ou igual ao maior dos seis atributos. Com 33 anos ou mais, igual ao maior dos seis atributos. Não muda depois do cadastro.',
    example: 86,
    minimum: 1,
    maximum: 99,
  })
  @IsDefined({ message: REQUIRED })
  @IsInt({ message: INTEGER })
  @Min(1, { message: MIN })
  @Max(99, { message: MAX })
  @PotentialMatchesAttributes()
  potential!: number;
}
