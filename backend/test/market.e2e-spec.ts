import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { ClubResponse } from '../src/clubs/interfaces/club.interface';
import { formatBrazilDateTime } from '../src/common/rules/datetime';
import { MarketOperationResponse } from '../src/market/interfaces/transaction.interface';
import { MAX_SQUAD_SIZE } from '../src/market/market.service';
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

const DAY_MS = 24 * 60 * 60 * 1000;

function loyaltyIn(days: number): string {
  return formatBrazilDateTime(new Date(Date.now() + days * DAY_MS)).replace(
    /:\d{2}-03:00$/,
    '-03:00',
  );
}

function randomWord(length: number): string {
  return Array.from({ length }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26)),
  ).join('');
}

describe('Mercado (e2e)', () => {
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
    const byPlayer = { where: { playerId: { in: playerIds } } };
    await prisma.transaction.deleteMany(byPlayer);
    await prisma.contract.deleteMany(byPlayer);
    await prisma.player.deleteMany({ where: { id: { in: playerIds } } });
    await prisma.club.deleteMany({ where: { id: { in: clubIds } } });
    await app.close();
  });

  async function createClub(): Promise<ClubResponse> {
    let word = randomWord(7);
    while (new Set(word.slice(0, 3)).size === 1) {
      word = randomWord(7);
    }
    const response = await request(app.getHttpServer())
      .post('/api/v1/clubs')
      .send({
        name: `${word[0].toUpperCase()}${word.slice(1)} Clube`,
        acronym: word.slice(0, 3).toUpperCase(),
      })
      .expect(201);
    const club = response.body as ClubResponse;
    clubIds.push(club.id);
    return club;
  }

  async function createPlayer(body: object = meiaLua): Promise<PlayerResponse> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send(body)
      .expect(201);
    const player = response.body as PlayerResponse;
    playerIds.push(player.id);
    return player;
  }

  function buy(playerId: number, body: object) {
    return request(app.getHttpServer())
      .post(`/api/v1/players/${playerId}/buy`)
      .send(body);
  }

  it('compra o jogador pelo valor de mercado, com taxa, contrato e transação', async () => {
    const club = await createClub();
    const player = await createPlayer();
    await request(app.getHttpServer())
      .patch(`/api/v1/players/${player.id}/condition`)
      .send({ condition: 'MAL_CONDICIONADO' })
      .expect(200);
    const loyaltyUntil = loyaltyIn(120);

    const response = await buy(player.id, {
      club_id: club.id,
      loyalty_until: loyaltyUntil,
    }).expect(200);
    const body = response.body as MarketOperationResponse;

    expect(body).toEqual({
      id: expect.any(Number) as number,
      club_id: club.id,
      player_id: player.id,
      player_name: 'Meia Lua',
      type: 'COMPRA',
      value: 37,
      fee: 1.85,
      penalty: 0,
      profit: null,
      cash_change: -38.85,
      created_at: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/,
      ) as string,
      contract: {
        purchase_value: 37,
        loyalty_until: loyaltyUntil.replace('-03:00', ':00-03:00'),
        status: 'ATIVO',
      },
      club_cash: 261.15,
    });

    const updated = await request(app.getHttpServer())
      .get(`/api/v1/players/${player.id}`)
      .expect(200);
    expect((updated.body as PlayerResponse).club_id).toBe(club.id);
  });

  it('recusa com 409 jogador que não está livre', async () => {
    const [first, second] = [await createClub(), await createClub()];
    const player = await createPlayer();
    await buy(player.id, {
      club_id: first.id,
      loyalty_until: loyaltyIn(30),
    }).expect(200);

    await buy(player.id, {
      club_id: second.id,
      loyalty_until: loyaltyIn(30),
    }).expect(409);
  });

  it('recusa com 409 custo acima de 50% do caixa, sem gravar nada', async () => {
    const club = await createClub();
    const player = await createPlayer();
    await prisma.club.update({ where: { id: club.id }, data: { cash: 80.99 } });

    const response = await buy(player.id, {
      club_id: club.id,
      loyalty_until: loyaltyIn(30),
    }).expect(409);

    expect((response.body as ErrorBody).message).toContain('50% do caixa');
    const clubAfter = await prisma.club.findUniqueOrThrow({
      where: { id: club.id },
    });
    expect(clubAfter.cash.toFixed(2)).toBe('80.99');
    expect(
      await prisma.contract.count({ where: { playerId: player.id } }),
    ).toBe(0);
    expect(
      (await prisma.player.findUniqueOrThrow({ where: { id: player.id } }))
        .clubId,
    ).toBeNull();
  });

  it('aceita custo igual a 50% do caixa', async () => {
    const club = await createClub();
    const player = await createPlayer();
    await prisma.club.update({ where: { id: club.id }, data: { cash: 84 } });

    const response = await buy(player.id, {
      club_id: club.id,
      loyalty_until: loyaltyIn(30),
    }).expect(200);

    expect((response.body as MarketOperationResponse).club_cash).toBe(42);
  });

  it(`recusa com 409 compra para elenco com ${MAX_SQUAD_SIZE} jogadores`, async () => {
    const club = await createClub();
    for (let index = 0; index < MAX_SQUAD_SIZE; index++) {
      const player = await createPlayer();
      await prisma.player.update({
        where: { id: player.id },
        data: { clubId: club.id },
      });
    }
    const player = await createPlayer();

    await buy(player.id, {
      club_id: club.id,
      loyalty_until: loyaltyIn(30),
    }).expect(409);
  });

  it('recusa com 409 a recompra pelo clube que vendeu, mas aceita outro clube', async () => {
    const [seller, other] = [await createClub(), await createClub()];
    const player = await createPlayer();
    await prisma.transaction.create({
      data: {
        clubId: seller.id,
        playerId: player.id,
        playerName: player.name,
        type: 'VENDA',
        value: 40,
        fee: 0,
        penalty: 0,
        profit: 0,
        cashChange: 40,
      },
    });

    await buy(player.id, {
      club_id: seller.id,
      loyalty_until: loyaltyIn(30),
    }).expect(409);
    await buy(player.id, {
      club_id: other.id,
      loyalty_until: loyaltyIn(30),
    }).expect(200);
  });

  it.each([
    ['club_id ausente', { club_id: undefined }],
    ['club_id como texto', { club_id: '1' }],
    ['club_id zero', { club_id: 0 }],
    ['club_id negativo', { club_id: -1 }],
    ['loyalty_until ausente', { loyalty_until: undefined }],
    ['loyalty_until sem fuso', { loyalty_until: '2027-03-02T10:15' }],
    [
      'loyalty_until com segundos',
      { loyalty_until: '2027-03-02T10:15:00-03:00' },
    ],
    ['loyalty_until inexistente', { loyalty_until: '2027-02-30T10:15-03:00' }],
    ['loyalty_until no passado', { loyalty_until: loyaltyIn(-1) }],
    ['loyalty_until além de 1.095 dias', { loyalty_until: loyaltyIn(1096) }],
  ])('recusa com 400: %s', async (_, overrides) => {
    const club = await createClub();
    const player = await createPlayer();

    const response = await buy(player.id, {
      club_id: club.id,
      loyalty_until: loyaltyIn(30),
      ...overrides,
    }).expect(400);

    expect((response.body as ErrorBody).message).toEqual(expect.any(String));
  });

  it('responde 404 para jogador inexistente, excluído ou clube inexistente', async () => {
    const club = await createClub();
    const deleted = await createPlayer();
    await request(app.getHttpServer())
      .delete(`/api/v1/players/${deleted.id}`)
      .expect(204);
    const player = await createPlayer();
    const body = { club_id: club.id, loyalty_until: loyaltyIn(30) };

    await buy(2147483647, body).expect(404);
    await buy(deleted.id, body).expect(404);
    await buy(player.id, { ...body, club_id: 2147483647 }).expect(404);
  });
});
