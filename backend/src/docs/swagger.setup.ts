import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

export const DOCS_PATH = 'api/docs';

export enum ApiTag {
  PLAYERS = 'Jogadores',
  CLUBS = 'Clubes',
  MARKET = 'Mercado',
  LEAGUE = 'Liga',
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Passe API')
    .setDescription(
      'Mercado de jogadores de uma liga de futebol fictícia: jogadores, clubes, compra e venda, escalação, partidas e classificação.',
    )
    .setVersion('1.0')
    .addTag(
      ApiTag.PLAYERS,
      'Cadastro, consulta, edição e exclusão de jogadores',
    )
    .addTag(ApiTag.CLUBS, 'Cadastro e consulta de clubes, elenco e escalação')
    .addTag(ApiTag.MARKET, 'Compra, venda e histórico de transações')
    .addTag(ApiTag.LEAGUE, 'Partidas e classificação')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ErrorResponseDto],
  });

  SwaggerModule.setup(DOCS_PATH, app, document);
}
