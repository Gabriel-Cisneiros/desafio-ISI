import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { ClubResponse } from '../src/clubs/interfaces/club.interface';
import { formatBrazilDateTime } from '../src/common/rules/datetime';
import { LineupResponse } from '../src/lineups/interfaces/lineup.interface';
import { PlayerResponse } from '../src/players/interfaces/player.interface';
import { PrismaService } from '../src/prisma/prisma.service';

const attributes = {
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

describe('Escalação (e2e)', () => {
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

  afterEach(async () => {
    const byPlayer = { where: { playerId: { in: playerIds } } };
    await prisma.lineupEntry.deleteMany(byPlayer);
    await prisma.transaction.deleteMany(byPlayer);
    await prisma.contract.deleteMany(byPlayer);
    await prisma.player.deleteMany({ where: { id: { in: playerIds } } });
    await prisma.club.deleteMany({ where: { id: { in: clubIds } } });
    playerIds.length = 0;
    clubIds.length = 0;
  });

  afterAll(async () => {
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

  async function createPlayer(
    name: string,
    position: string,
  ): Promise<PlayerResponse> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({ name, position, ...attributes })
      .expect(201);
    const player = response.body as PlayerResponse;
    playerIds.push(player.id);
    return player;
  }

  async function signPlayer(
    clubId: number,
    name: string,
    position: string,
  ): Promise<PlayerResponse> {
    const player = await createPlayer(name, position);
    await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: clubId, loyalty_until: loyaltyIn(30) })
      .expect(200);
    return player;
  }

  function setCondition(playerId: number, condition: string) {
    return request(app.getHttpServer())
      .patch(`/api/v1/players/${playerId}/condition`)
      .send({ condition })
      .expect(200);
  }

  function putLineup(clubId: number, body: object) {
    return request(app.getHttpServer())
      .put(`/api/v1/clubs/${clubId}/lineup`)
      .send(body);
  }

  function getLineup(clubId: number) {
    return request(app.getHttpServer()).get(`/api/v1/clubs/${clubId}/lineup`);
  }

  async function createSquad() {
    const club = await createClub();
    const squad = {
      gol: await signPlayer(club.id, 'Rui Prado', 'GOL'),
      lat: await signPlayer(club.id, 'Davi Lins', 'LAT'),
      zag: await signPlayer(club.id, 'Téo Brandão', 'ZAG'),
      mei: await signPlayer(club.id, 'Lauro Neves', 'MEI'),
      ata: await signPlayer(club.id, 'Otto Rangel', 'ATA'),
    };
    return { club, squad };
  }

  function idsOf(response: request.Response): number[] {
    return (response.body as LineupResponse).players.map((player) => player.id);
  }

  it('sem escalação devolve formation null, players vazio e complete false', async () => {
    const club = await createClub();

    const response = await getLineup(club.id).expect(200);

    expect(response.body).toEqual({
      club_id: club.id,
      formation: null,
      complete: false,
      players: [],
    });
  });

  it('escala os 5 titulares em qualquer ordem e devolve na ordem do elenco', async () => {
    const { club, squad } = await createSquad();
    await setCondition(squad.lat.id, 'MAL_CONDICIONADO');
    const cashBefore = (
      await prisma.club.findUniqueOrThrow({ where: { id: club.id } })
    ).cash.toNumber();

    const response = await putLineup(club.id, {
      formation: '2-1-1',
      player_ids: [
        squad.ata.id,
        squad.lat.id,
        squad.gol.id,
        squad.mei.id,
        squad.zag.id,
      ],
    }).expect(200);
    const body = response.body as LineupResponse;

    expect(body.club_id).toBe(club.id);
    expect(body.formation).toBe('2-1-1');
    expect(body.complete).toBe(true);
    expect(idsOf(response)).toEqual([
      squad.gol.id,
      squad.zag.id,
      squad.lat.id,
      squad.mei.id,
      squad.ata.id,
    ]);
    expect(body.players[2]).toMatchObject({
      condition: 'MAL_CONDICIONADO',
      club_id: club.id,
      overall: expect.any(Number) as number,
      market_value: expect.any(Number) as number,
    });
    expect(
      (
        await prisma.club.findUniqueOrThrow({ where: { id: club.id } })
      ).cash.toNumber(),
    ).toBe(cashBefore);

    const lineup = await getLineup(club.id).expect(200);
    expect(lineup.body).toEqual(response.body);
  });

  it('substitui a escalação inteira', async () => {
    const { club, squad } = await createSquad();
    const otherMei = await signPlayer(club.id, 'Caio Mendes', 'MEI');
    await putLineup(club.id, {
      formation: '2-1-1',
      player_ids: [
        squad.gol.id,
        squad.zag.id,
        squad.lat.id,
        squad.mei.id,
        squad.ata.id,
      ],
    }).expect(200);

    const response = await putLineup(club.id, {
      formation: '1-2-1',
      player_ids: [
        squad.gol.id,
        squad.zag.id,
        squad.mei.id,
        otherMei.id,
        squad.ata.id,
      ],
    }).expect(200);

    expect((response.body as LineupResponse).formation).toBe('1-2-1');
    expect(idsOf(response)).toEqual([
      squad.gol.id,
      squad.zag.id,
      otherMei.id,
      squad.mei.id,
      squad.ata.id,
    ]);
    expect(await prisma.lineupEntry.count({ where: { clubId: club.id } })).toBe(
      5,
    );
  });

  it('tira o titular vendido e mantém a formação, incompleta', async () => {
    const { club, squad } = await createSquad();
    await putLineup(club.id, {
      formation: '2-1-1',
      player_ids: [
        squad.gol.id,
        squad.zag.id,
        squad.lat.id,
        squad.mei.id,
        squad.ata.id,
      ],
    }).expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/players/${squad.ata.id}/sell`)
      .expect(200);

    const response = await getLineup(club.id).expect(200);
    expect(response.body).toMatchObject({
      formation: '2-1-1',
      complete: false,
    });
    expect(idsOf(response)).toEqual([
      squad.gol.id,
      squad.zag.id,
      squad.lat.id,
      squad.mei.id,
    ]);
  });

  it('tira o titular que passa a DOENTE, e ele não volta sozinho', async () => {
    const { club, squad } = await createSquad();
    await putLineup(club.id, {
      formation: '2-1-1',
      player_ids: [
        squad.gol.id,
        squad.zag.id,
        squad.lat.id,
        squad.mei.id,
        squad.ata.id,
      ],
    }).expect(200);

    await setCondition(squad.mei.id, 'DOENTE');
    await setCondition(squad.mei.id, 'MAL_CONDICIONADO');

    const response = await getLineup(club.id).expect(200);
    expect(response.body).toMatchObject({
      formation: '2-1-1',
      complete: false,
    });
    expect(idsOf(response)).not.toContain(squad.mei.id);
    expect(idsOf(response)).toHaveLength(4);
  });

  describe('recusas com 409, sem gravar nada', () => {
    it('jogador de outro clube, jogador livre, DOENTE e posições fora da formação', async () => {
      const { club, squad } = await createSquad();
      const otherClub = await createClub();
      const foreign = await signPlayer(otherClub.id, 'Beto Vale', 'ATA');
      const free = await createPlayer('Ivo Rocha', 'ATA');
      const base = [squad.gol.id, squad.zag.id, squad.lat.id, squad.mei.id];

      await putLineup(club.id, {
        formation: '2-1-1',
        player_ids: [...base, foreign.id],
      }).expect(409);
      await putLineup(club.id, {
        formation: '2-1-1',
        player_ids: [...base, free.id],
      }).expect(409);
      await putLineup(club.id, {
        formation: '2-2',
        player_ids: [...base, squad.ata.id],
      }).expect(409);

      await setCondition(squad.ata.id, 'DOENTE');
      const response = await putLineup(club.id, {
        formation: '2-1-1',
        player_ids: [...base, squad.ata.id],
      }).expect(409);
      expect(response.body).toHaveProperty('message');

      const lineup = await getLineup(club.id).expect(200);
      expect(lineup.body).toMatchObject({ formation: null, players: [] });
    });

    it('não apaga a escalação anterior', async () => {
      const { club, squad } = await createSquad();
      const ids = [
        squad.gol.id,
        squad.zag.id,
        squad.lat.id,
        squad.mei.id,
        squad.ata.id,
      ];
      await putLineup(club.id, { formation: '2-1-1', player_ids: ids }).expect(
        200,
      );

      await putLineup(club.id, { formation: '3-1', player_ids: ids }).expect(
        409,
      );

      const lineup = await getLineup(club.id).expect(200);
      expect(lineup.body).toMatchObject({ formation: '2-1-1', complete: true });
    });
  });

  it('responde 404 para clube, jogador inexistente ou excluído', async () => {
    const { club, squad } = await createSquad();
    const removed = await createPlayer('Ivo Rocha', 'ATA');
    await request(app.getHttpServer())
      .delete(`/api/v1/players/${removed.id}`)
      .expect(204);
    const base = [squad.gol.id, squad.zag.id, squad.lat.id, squad.mei.id];

    await getLineup(2147483647).expect(404);
    await getLineup(0).expect(404);
    await putLineup(2147483647, {
      formation: '2-1-1',
      player_ids: [...base, squad.ata.id],
    }).expect(404);
    await putLineup(club.id, {
      formation: '2-1-1',
      player_ids: [...base, 2147483647],
    }).expect(404);
    await putLineup(club.id, {
      formation: '2-1-1',
      player_ids: [...base, removed.id],
    }).expect(404);
  });

  it.each([
    [{ player_ids: [1, 2, 3, 4, 5] }],
    [{ formation: '2-1-1', player_ids: [1, 2, 3, 4] }],
    [{ formation: '2-1-1', player_ids: [1, 1, 2, 3, 4] }],
    [{ formation: '2-1-1', player_ids: [1, 2, 3, 4, '5'] }],
    [{ formation: '4-1', player_ids: [1, 2, 3, 4, 5] }],
    [[]],
  ])('recusa com 400 o corpo %j', async (body) => {
    const club = await createClub();

    await putLineup(club.id, body).expect(400);
  });
});
