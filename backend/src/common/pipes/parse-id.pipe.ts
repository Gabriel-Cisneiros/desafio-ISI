import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

const ID_PATTERN = /^[1-9]\d*$/;
const MAX_ID = 2_147_483_647;

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);

    if (!ID_PATTERN.test(value) || id > MAX_ID) {
      throw new NotFoundException('Recurso não encontrado.');
    }

    return id;
  }
}
