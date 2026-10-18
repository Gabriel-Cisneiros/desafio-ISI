import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

const INVALID_BODY_MESSAGE = 'O corpo da requisição deve ser um objeto JSON.';
const INVALID_DATA_MESSAGE = 'Dados inválidos.';

function isJsonObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function findFirstMessage(errors: ValidationError[]): string | undefined {
  for (const error of errors) {
    const constraints = error.constraints ?? {};
    const message = constraints.isDefined ?? Object.values(constraints).at(-1);
    if (message) {
      return message;
    }

    const childMessage = findFirstMessage(error.children ?? []);
    if (childMessage) {
      return childMessage;
    }
  }

  return undefined;
}

@Injectable()
export class ApiValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          findFirstMessage(errors) ?? INVALID_DATA_MESSAGE,
        ),
    });
  }

  async transform(value: unknown, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.type === 'body' && !isJsonObject(value)) {
      throw new BadRequestException(INVALID_BODY_MESSAGE);
    }

    return super.transform(value, metadata);
  }

  protected transformPrimitive(value: unknown): unknown {
    return value;
  }
}
