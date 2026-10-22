import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Descrição do erro, em texto.',
    example: 'O campo nome deve ter de 3 a 100 caracteres.',
  })
  message!: string;
}
