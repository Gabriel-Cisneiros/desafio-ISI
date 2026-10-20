import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
import {
  HasAcronymFormat,
  HasDifferentLetters,
  MatchesName,
} from '../../common/validators/acronym.validators';
import { REQUIRED, STRING } from '../../common/validators/messages';
import {
  CharacterLength,
  HasNoControlCharacters,
  HasOnlyNameCharacters,
  NormalizeName,
  WordCount,
} from '../../common/validators/name.validators';

export class CreateClubDto {
  @ApiProperty({
    description:
      'Nome do clube, único sem diferenciar maiúsculas e minúsculas (os acentos diferenciam). Espaços das pontas são removidos e espaços repetidos viram um só. De 3 a 60 caracteres e de 2 a 5 palavras, só com letras, espaços, hífen e ponto.',
    example: 'Águias FC',
    minLength: 3,
    maxLength: 60,
  })
  @IsDefined({ message: REQUIRED })
  @IsString({ message: STRING })
  @NormalizeName()
  @HasNoControlCharacters()
  @HasOnlyNameCharacters()
  @CharacterLength(3, 60)
  @WordCount(2, 5)
  name!: string;

  @ApiProperty({
    description:
      'Sigla única, com exatamente 3 letras de A a Z, maiúsculas e sem acento, que aparecem no nome nessa ordem (sem diferenciar maiúsculas e acentos), sendo a primeira delas a primeira letra do nome. As três letras não podem ser todas iguais.',
    example: 'AGU',
    minLength: 3,
    maxLength: 3,
  })
  @IsDefined({ message: REQUIRED })
  @IsString({ message: STRING })
  @HasAcronymFormat()
  @HasDifferentLetters()
  @MatchesName('name')
  acronym!: string;
}
