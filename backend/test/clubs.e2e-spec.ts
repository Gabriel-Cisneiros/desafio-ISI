import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import {
  ClubDetailsResponse,
  ClubResponse,
} from '../src/clubs/interfaces/club.interface';
import { MAX_CLUBS } from '../src/clubs/clubs.service';
import { PlayerResponse } from '../src/players/interfaces/player.interface';
import { PrismaService } from '../src/prisma/prisma.service';

interface ErrorBody {
  message: string;
}

function randomWord(length: number): string {
  return Array.from({ length }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26)),
  ).join('');
}

function randomClub() {
  let word = randomWord(7);
  while (new Set(word.slice(0, 3)).size === 1) {
    word = randomWord(7);
  }
  return {
    name: `${word[0].toUpperCase()}${word.slice(1)} Clube`,
    acronym: word.slice(0, 3).toUpperCase(),
  };
}

describe('Clubes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const clubIds: number[] = [];
  const playerIds: number[] = [];

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
    await prisma.player.deleteMany({ where: { id: { in: playerIds } } });
    await prisma.club.deleteMany({ where: { id: { in: clubIds } } });
    await app.close();
  });

  async function createClub(body: object) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send(body);

    if (response.status === 201) {
      clubIds.push((response.body as ClubResponse).id);
    }
    return response;
  }

  async function createPlayerIn(
    clubId: number,
    name: string,
    position: string,
  ): Promise<PlayerResponse> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name,
        position,
        agility: 85,
        age: 25,
        pace: 70,
        shooting: 68,
        passing: 82,
        dribbling: 79,
        defending: 55,
        physical: 64,
        potential: 86,
      })
      .expect(201);
    const player = response.body as PlayerResponse;
    playerIds.push(player.id);
    await prisma.player.update({ where: { id: player.id }, data: { clubId } });
    return player;
  }

  describe('POST /clubs', () => {
    it('cria o clube com 300,00 em caixa e sem jogadores', async () => {
      const club = randomClub();
      const response = await createClub({
        name: `  ${club.name.replace(' ', '   ')} `,
        acronym: club.acronym,
        cash: 1000,
      });
      const body = response.body as ClubResponse;

      expect(response.status).toBe(201);
      expect(response.headers.location).toBe(`/api/v1/clubs/${body.id}`);
      expect(body).toEqual({
        id: body.id,
        name: club.name,
        acronym: club.acronym,
        cash: 300,
        squad_value: 0,
        net_worth: 300,
      });
    });

    it('recusa nome repetido sem diferenciar maiúsculas, mas aceita outro acento', async () => {
      const word = randomWord(6);
      const name = `Á${word} Clube`;
      await createClub({ name, acronym: `A${word[0].toUpperCase()}C` }).then(
        (response) => expect(response.status).toBe(201),
      );

      const repeated = await createClub({
        name: `  á${word.toUpperCase()}   clube `,
        acronym: `A${word[1].toUpperCase()}C`,
      });
      expect(repeated.status).toBe(409);
      expect((repeated.body as ErrorBody).message).toBe(
        'Já existe um clube com esse nome.',
      );

      const withoutAccent = await createClub({
        name: `A${word} Clube`,
        acronym: `A${word[1].toUpperCase()}C`,
      });
      expect(withoutAccent.status).toBe(201);
    });

    it('recusa sigla repetida', async () => {
      const club = randomClub();
      await createClub(club);

      const response = await createClub({
        name: `${club.name} Novo`,
        acronym: club.acronym,
      });

      expect(response.status).toBe(409);
      expect((response.body as ErrorBody).message).toBe(
        'Já existe um clube com essa sigla.',
      );
    });

    it.each([
      ['nome com uma palavra', { name: 'Águias', acronym: 'AGU' }],
      ['nome com número', { name: 'Clube 10', acronym: 'CLU' }],
      [
        'sigla que não corresponde ao nome',
        { name: 'Águias FC', acronym: 'GUA' },
      ],
      ['sigla com letras iguais', { name: 'Aaa Clube', acronym: 'AAA' }],
      ['sigla ausente', { name: 'Águias FC' }],
    ])('recusa com 400: %s', async (_, body) => {
      const response = await createClub(body);

      expect(response.status).toBe(400);
      expect((response.body as ErrorBody).message).toEqual(expect.any(String));
    });

    it(`recusa a criação do clube depois de ${MAX_CLUBS} clubes`, async () => {
      const existing = await prisma.club.count();
      for (let count = existing; count < MAX_CLUBS; count++) {
        expect((await createClub(randomClub())).status).toBe(201);
      }

      const response = await createClub(randomClub());

      expect(response.status).toBe(409);
      expect((response.body as ErrorBody).message).toBe(
        `A liga já tem ${MAX_CLUBS} clubes, o máximo permitido.`,
      );
      await prisma.club.deleteMany({ where: { id: { in: clubIds } } });
      clubIds.length = 0;
    });
  });

  describe('GET /clubs', () => {
    it('lista os clubes em ordem alfabética, sem o elenco', async () => {
      const word = randomWord(6);
      const names = [`Gama${word} FC`, `Épsilon${word} FC`, `Delta${word} FC`];
      for (const name of names) {
        await createClub({
          name,
          acronym: name.slice(0, 3).toUpperCase().replace('É', 'E'),
        });
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/clubs')
        .expect(200);
      const clubs = (response.body as ClubResponse[]).filter((club) =>
        names.includes(club.name),
      );

      expect(clubs.map((club) => club.name)).toEqual([
        names[2],
        names[1],
        names[0],
      ]);
      expect(clubs[0]).not.toHaveProperty('players');
    });
  });

  describe('GET /clubs/:id', () => {
    it('devolve o elenco ordenado por posição, nome e id, com os valores', async () => {
      const club = (await createClub(randomClub())).body as ClubResponse;
      const atacante = await createPlayerIn(club.id, 'Zeca Lima', 'ATA');
      const meiaB = await createPlayerIn(club.id, 'Bruno Melo', 'MEI');
      const meiaA = await createPlayerIn(club.id, 'Ana Melo', 'MEI');
      const goleiro = await createPlayerIn(club.id, 'Yuri Costa', 'GOL');

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clubs/${club.id}`)
        .expect(200);
      const body = response.body as ClubDetailsResponse;
      const squadValue = [atacante, meiaB, meiaA, goleiro].reduce(
        (total, player) => total + player.market_value * 100,
        0,
      );

      expect(body.players.map((player) => player.id)).toEqual([
        goleiro.id,
        meiaA.id,
        meiaB.id,
        atacante.id,
      ]);
      expect(body.squad_value).toBe(squadValue / 100);
      expect(body.net_worth).toBe((30000 + squadValue) / 100);
      expect(body.players[0]).toEqual({ ...goleiro, club_id: club.id });
    });

    it('responde 404 para clube inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/clubs/2147483647')
        .expect(404);
    });
  });
});
