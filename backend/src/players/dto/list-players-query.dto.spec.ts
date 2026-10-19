import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ApiValidationPipe } from '../../common/pipes/api-validation.pipe';
import { PlayerSort } from '../player-sort';
import { ListPlayersQueryDto } from './list-players-query.dto';

describe('ListPlayersQueryDto', () => {
  const pipe = new ApiValidationPipe();
  const metadata: ArgumentMetadata = {
    type: 'query',
    metatype: ListPlayersQueryDto,
  };

  const parse = (query: Record<string, string>) =>
    pipe.transform(query, metadata) as Promise<ListPlayersQueryDto>;

  it('aceita a query vazia', async () => {
    await expect(parse({})).resolves.toEqual({});
  });

  it('converte os valores aceitos', async () => {
    await expect(
      parse({
        search: '  meia   lua ',
        position: 'MEI',
        condition: 'APTO',
        free: 'false',
        club_id: '3',
        min_age: '16',
        max_age: '45',
        min_value: '0.5',
        max_value: '550',
        sort: 'value_desc,name',
        page: '2',
        limit: '50',
      }),
    ).resolves.toEqual({
      search: 'meia lua',
      position: 'MEI',
      condition: 'APTO',
      free: false,
      club_id: 3,
      min_age: 16,
      max_age: 45,
      min_value: 0.5,
      max_value: 550,
      sort: [PlayerSort.VALUE_DESC, PlayerSort.NAME],
      page: 2,
      limit: 50,
    });
  });

  it('ignora parâmetros desconhecidos', async () => {
    await expect(parse({ ordem: 'nome' })).resolves.toEqual({});
  });

  it.each([
    ['min igual a max', { min_age: '20', max_age: '20' }],
    ['decimal com uma casa', { min_value: '10.5' }],
    ['decimal zero', { min_value: '0' }],
  ])('aceita %s', async (_, query) => {
    await expect(parse(query)).resolves.toBeDefined();
  });

  it.each([
    ['search vazio', { search: '' }],
    ['search só com espaços', { search: '   ' }],
    ['search com 1 caractere', { search: 'a' }],
    ['position vazia', { position: '' }],
    ['position em minúsculas', { position: 'mei' }],
    ['condition fora da lista', { condition: 'MACHUCADO' }],
    ['free em maiúsculas', { free: 'TRUE' }],
    ['free=true com club_id', { free: 'true', club_id: '1' }],
    ['inteiro com sinal', { page: '+1' }],
    ['inteiro negativo', { club_id: '-1' }],
    ['inteiro zero', { page: '0' }],
    ['inteiro com zero à esquerda', { page: '01' }],
    ['inteiro com ponto', { limit: '10.0' }],
    ['inteiro com expoente', { limit: '1e1' }],
    ['limit acima de 50', { limit: '51' }],
    ['idade abaixo de 16', { min_age: '15' }],
    ['idade acima de 45', { max_age: '46' }],
    ['min_age maior que max_age', { min_age: '30', max_age: '20' }],
    ['decimal com três casas', { min_value: '10.555' }],
    ['decimal com vírgula', { min_value: '10,5' }],
    ['decimal com zero à esquerda', { min_value: '01.5' }],
    ['decimal com ponto no fim', { min_value: '10.' }],
    ['decimal com sinal', { min_value: '-1' }],
    ['decimal acima de 550', { max_value: '550.01' }],
    ['min_value maior que max_value', { min_value: '20', max_value: '10' }],
    ['sort repetindo o campo', { sort: 'value_asc,value_desc' }],
  ])('recusa com 400: %s', async (_, query) => {
    await expect(parse(query)).rejects.toThrow(BadRequestException);
  });

  it('aceita free=false com club_id', async () => {
    await expect(parse({ free: 'false', club_id: '1' })).resolves.toEqual({
      free: false,
      club_id: 1,
    });
  });
});
