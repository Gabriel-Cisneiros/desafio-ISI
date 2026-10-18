import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { PlayerResponse } from '../src/players/interfaces/player.interface';
import { PrismaService } from '../src/prisma/prisma.service';

interface ErrorBody {
  message: string;
}

const meiaLua = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

describe('Jogadores (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdIds: number[] = [];
  const createdClubIds: number[] = [];

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.lineupEntry.deleteMany({
      where: { playerId: { in: createdIds } },
    });
    await prisma.player.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.club.deleteMany({ where: { id: { in: createdClubIds } } });
    await app.close();
  });

  async function createClubWith(playerId: number): Promise<number> {
    const acronym = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    ).join('');
    const name = `Clube Teste ${acronym}`;
    const club = await prisma.club.create({
      data: { name, normalizedName: name.toLowerCase(), acronym },
    });
    createdClubIds.push(club.id);

    await prisma.player.update({
      where: { id: playerId },
      data: { clubId: club.id },
    });
    return club.id;
  }

  function updatePlayer(id: number, body: object) {
    return request(app.getHttpServer()).put(`/api/v1/players/${id}`).send(body);
  }

  async function createPlayer(body: object | string) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .set('Content-Type', 'application/json')
      .send(body);

    if (response.status === 201) {
      createdIds.push((response.body as PlayerResponse).id);
    }
    return response;
  }

  describe('POST /players', () => {
    it('cadastra o jogador APTO, livre e com os valores calculados', async () => {
      const response = await createPlayer(meiaLua);
      const player = response.body as PlayerResponse;

      expect(response.status).toBe(201);
      expect(response.headers.location).toBe(`/api/v1/players/${player.id}`);
      expect(player).toEqual({
        id: player.id,
        ...meiaLua,
        condition: 'APTO',
        base_value: 40,
        market_value: 40,
        overall: 75,
        club_id: null,
      });
    });

    it('ignora campos calculados, controlados e desconhecidos (V7)', async () => {
      const response = await createPlayer({
        ...meiaLua,
        id: 999999,
        base_value: 1,
        market_value: 1,
        overall: 1,
        club_id: 1,
        condition: 'DOENTE',
        apelido: 'Lua',
      });
      const player = response.body as PlayerResponse;

      expect(response.status).toBe(201);
      expect(player.id).not.toBe(999999);
      expect(player).toMatchObject({
        condition: 'APTO',
        base_value: 40,
        club_id: null,
      });
      expect(player).not.toHaveProperty('apelido');
    });

    it('normaliza os espaços do nome (V4)', async () => {
      const response = await createPlayer({
        ...meiaLua,
        name: '  Meia   Lua ',
      });

      expect(response.status).toBe(201);
      expect((response.body as PlayerResponse).name).toBe('Meia Lua');
    });

    it('aceita inteiro escrito com parte fracionária zero (V2)', async () => {
      const response = await createPlayer(
        JSON.stringify(meiaLua).replace('"agility":85', '"agility":85.0'),
      );

      expect(response.status).toBe(201);
    });

    it.each([
      ['nome ausente', { name: undefined }],
      ['nome nulo', { name: null }],
      ['nome só com espaços', { name: '   ' }],
      ['nome com uma palavra', { name: 'Lua' }],
      ['nome com número', { name: 'Meia Lua 2' }],
      ['nome com tabulação', { name: 'Meia\tLua' }],
      ['nome com 101 caracteres', { name: `Meia ${'a'.repeat(96)}` }],
      ['posição em minúsculas (V5)', { position: 'mei' }],
      ['número enviado como texto (V2)', { agility: '85' }],
      ['inteiro com parte fracionária (V2)', { agility: 85.5 }],
      ['campo com outro nome', { agility: undefined, Agility: 85 }],
      ['agilidade 0', { agility: 0 }],
      ['agilidade acima de 85 com 35 anos', { age: 35, agility: 86 }],
      ['idade 15', { age: 15 }],
      ['idade 46', { age: 46 }],
      ['atributo 100', { pace: 100, potential: 100 }],
      [
        'soma dos atributos 481',
        {
          pace: 81,
          shooting: 80,
          passing: 80,
          dribbling: 80,
          defending: 80,
          physical: 80,
          potential: 81,
        },
      ],
      ['potencial menor que o maior atributo', { potential: 81 }],
      ['potencial acima do maior atributo com 33 anos', { age: 33 }],
    ])('recusa com 400: %s', async (_, overrides) => {
      const response = await createPlayer({ ...meiaLua, ...overrides });

      expect(response.status).toBe(400);
      expect((response.body as ErrorBody).message).toEqual(expect.any(String));
    });

    it.each([
      [{ name: null }, 'O campo name é obrigatório.'],
      [{ name: 42 }, 'O campo name deve ser um texto.'],
      [
        { name: 'Meia\tLua' },
        'O campo name não pode ter tabulação, quebra de linha nem outros caracteres de controle.',
      ],
      [{ agility: '85' }, 'O campo agility deve ser um número inteiro.'],
      [{ potential: null }, 'O campo potential é obrigatório.'],
    ])(
      'explica o erro mais básico do campo: %j',
      async (overrides, message) => {
        const response = await createPlayer({ ...meiaLua, ...overrides });

        expect(response.status).toBe(400);
        expect((response.body as ErrorBody).message).toBe(message);
      },
    );

    it.each([
      ['array', '[]'],
      ['texto', '"x"'],
      ['número', '10'],
    ])('recusa com 400 um corpo que é %s (V1)', async (_, body) => {
      const response = await createPlayer(body);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /players/:id', () => {
    it('devolve o jogador cadastrado', async () => {
      const created = (await createPlayer(meiaLua)).body as PlayerResponse;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/players/${created.id}`)
        .expect(200);

      expect(response.body).toEqual(created);
    });

    it('responde 404 para jogador excluído', async () => {
      const created = (await createPlayer(meiaLua)).body as PlayerResponse;
      await prisma.player.update({
        where: { id: created.id },
        data: { deletedAt: new Date() },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/players/${created.id}`)
        .expect(404);
    });

    it.each(['2147483647', '2147483648', '0', '-1', '01', '1.5', '1e3', 'abc'])(
      'responde 404 para o id %s',
      async (id) => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/players/${id}`)
          .expect(404);

        expect((response.body as ErrorBody).message).toEqual(
          expect.any(String),
        );
      },
    );
  });

  describe('PUT /players/:id', () => {
    const daviMelo = {
      ...meiaLua,
      name: 'Davi Melo',
      position: 'ATA',
      agility: 60,
      age: 22,
    };
    const edit = { name: 'Davi Melo', position: 'MEI', agility: 70, age: 23 };

    it('muda só nome, posição, agilidade e idade e recalcula o overall', async () => {
      const created = (await createPlayer(daviMelo)).body as PlayerResponse;

      const response = await updatePlayer(created.id, {
        ...edit,
        pace: 1,
        potential: 99,
        base_value: 1,
        condition: 'DOENTE',
        club_id: 1,
      }).expect(200);

      expect(response.body).toEqual({
        ...created,
        ...edit,
        overall: 75,
        market_value: created.base_value,
      });
    });

    it('aceita idade 33 sem mudar o potencial', async () => {
      const created = (await createPlayer(meiaLua)).body as PlayerResponse;

      const response = await updatePlayer(created.id, {
        ...edit,
        age: 33,
      }).expect(200);

      expect((response.body as PlayerResponse).potential).toBe(86);
    });

    it('mantém a posição de jogador com clube quando ela não muda', async () => {
      const created = (await createPlayer(meiaLua)).body as PlayerResponse;
      await createClubWith(created.id);

      await updatePlayer(created.id, { ...edit, age: 25 }).expect(200);
    });

    it.each([
      ['campo obrigatório ausente', { age: undefined }],
      ['agilidade acima de 85 com 35 anos', { age: 35, agility: 86 }],
      ['posição em minúsculas', { position: 'mei' }],
    ])('recusa com 400: %s', async (_, overrides) => {
      const created = (await createPlayer(meiaLua)).body as PlayerResponse;

      await updatePlayer(created.id, { ...edit, ...overrides }).expect(400);
    });

    it('recusa com 409 idade menor que a atual', async () => {
      const created = (await createPlayer(meiaLua)).body as PlayerResponse;

      const response = await updatePlayer(created.id, {
        ...edit,
        age: 24,
      }).expect(409);

      expect((response.body as ErrorBody).message).toBe(
        'A idade não pode ser menor que a atual (25).',
      );
    });

    it('recusa com 409 mudança de posição de jogador com clube', async () => {
      const created = (await createPlayer(meiaLua)).body as PlayerResponse;
      await createClubWith(created.id);

      await updatePlayer(created.id, { ...edit, position: 'ATA' }).expect(409);
    });

    it('responde 404 para jogador inexistente', async () => {
      await updatePlayer(2147483647, edit).expect(404);
    });
  });
});
