import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/env.validation';
import { setupSwagger } from './docs/swagger.setup';

export const API_PREFIX = 'api/v1';

export function setupApp(app: INestApplication): void {
  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: [configService.get('CORS_ORIGIN', { infer: true })],
  });
  app.enableShutdownHooks();
  setupSwagger(app);
}
