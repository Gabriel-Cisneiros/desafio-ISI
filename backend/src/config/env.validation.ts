import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const variables = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(variables);

  if (errors.length > 0) {
    const invalidNames = errors.map((error) => error.property).join(', ');
    throw new Error(
      `Variáveis de ambiente ausentes ou inválidas: ${invalidNames}. Confira o arquivo .env.`,
    );
  }

  return variables;
}
