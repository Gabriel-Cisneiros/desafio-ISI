import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { formatBrazilDateTime } from '../src/common/rules/datetime';
import { ClubResponse } from '../src/modules/clubs/interfaces/club.interface';
import { MatchDetailsResponse } from '../src/modules/matches/interfaces/match.interface';
import { StandingResponse } from '../src/modules/matches/interfaces/standing.interface';
import { PlayerResponse } from '../src/modules/players/interfaces/player.interface';
import { PrismaService } from '../src/prisma/prisma.service';

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

interface PlayerSpec {
  name: string;
  position: string;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  condition?: string;
}

const aguiasSquad: PlayerSpec[] = [
  { name: 'Rui Prado', position: 'GOL', defending: 77 },
  {
    name: 'Davi Lins',
    position: 'LAT',
    dribbling: 74,
    defending: 66,
    condition: 'MAL_CONDICIONADO',
  },
  { name: 'Téo Brandão', position: 'ZAG', defending: 84 },
  { name: 'Lauro Neves', position: 'MEI', passing: 82 },
  { name: 'Otto Rangel', position: 'ATA', shooting: 75 },
];

const deltaSquad: PlayerSpec[] = [
  { name: 'Ivo Teles', position: 'GOL', defending: 72 },
  { name: 'Hugo Vaz', position: 'ZAG', defending: 84 },
  { name: 'Lino Matos', position: 'LAT', dribbling: 79, defending: 63 },
  { name: 'Nei Soares', position: 'MEI', passing: 70 },
  { name: 'Ugo Falcão', position: 'ATA', shooting: 81 },
];

describe('Partidas (e2e)', () => {
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
    const byClub = {
      where: {
        OR: [{ homeClubId: { in: clubIds } }, { awayClubId: { in: clubIds } }],
      },
    };
    await prisma.matchDuel.deleteMany({ where: { match: byClub.where } });
    await prisma.match.deleteMany(byClub);
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

  async function signPlayer(
    clubId: number,
    spec: PlayerSpec,
  ): Promise<PlayerResponse> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/players')
      .send({
        name: spec.name,
        position: spec.position,
        agility: 60,
        age: 25,
        pace: 40,
        physical: 40,
        shooting: spec.shooting ?? 40,
        passing: spec.passing ?? 40,
        dribbling: spec.dribbling ?? 40,
        defending: spec.defending ?? 40,
        potential: 90,
      })
      .expect(201);
    const player = response.body as PlayerResponse;
    playerIds.push(player.id);
    await request(app.getHttpServer())
      .post(`/api/v1/players/${player.id}/buy`)
      .send({ club_id: clubId, loyalty_until: loyaltyIn(30) })
      .expect(200);
    if (spec.condition) {
      await request(app.getHttpServer())
        .patch(`/api/v1/players/${player.id}/condition`)
        .send({ condition: spec.condition })
        .expect(200);
    }
    return player;
  }

  async function createTeam(squad: PlayerSpec[], escalate = true) {
    const club = await createClub();
    const players: PlayerResponse[] = [];
    for (const spec of squad) {
      players.push(await signPlayer(club.id, spec));
    }
    if (escalate) {
      await request(app.getHttpServer())
        .put(`/api/v1/clubs/${club.id}/lineup`)
        .send({
          formation: '2-1-1',
          player_ids: players.map((player) => player.id),
        })
        .expect(200);
    }
    return { club, players };
  }

  function play(body: object) {
    return request(app.getHttpServer()).post('/api/v1/matches').send(body);
  }

  function getMatch(id: number | string) {
    return request(app.getHttpServer()).get(`/api/v1/matches/${id}`);
  }

  it('joga o exemplo Águias FC 1 × 2 Delta FC e grava os 6 duelos', async () => {
    const aguias = await createTeam(aguiasSquad);
    const delta = await createTeam(deltaSquad);
    const cashBefore = await prisma.club.findMany({
      where: { id: { in: [aguias.club.id, delta.club.id] } },
      select: { id: true, cash: true },
      orderBy: { id: 'asc' },
    });

    const response = await play({
      home_club_id: aguias.club.id,
      away_club_id: delta.club.id,
    }).expect(201);
    const body = response.body as MatchDetailsResponse;

    expect(response.headers.location).toBe(`/api/v1/matches/${body.id}`);
    expect(body.played_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/,
    );
    expect(body.home).toEqual({
      club_id: aguias.club.id,
      club_name: aguias.club.name,
      formation: '2-1-1',
      goals: 1,
    });
    expect(body.away).toEqual({
      club_id: delta.club.id,
      club_name: delta.club.name,
      formation: '2-1-1',
      goals: 2,
    });
    expect(body.result).toBe('VISITANTE');
    expect(body.duels[0]).toEqual({
      order: 1,
      attacking_club_id: aguias.club.id,
      attacker: {
        player_id: aguias.players[4].id,
        player_name: 'Otto Rangel',
        position: 'ATA',
        condition: 'APTO',
        attribute: 'shooting',
        value: 75,
      },
      defender: {
        player_id: delta.players[0].id,
        player_name: 'Ivo Teles',
        position: 'GOL',
        condition: 'APTO',
        attribute: 'defending',
        value: 72,
      },
      goal: true,
    });
    expect(
      body.duels.map((duel) => [
        duel.order,
        duel.attacking_club_id,
        duel.attacker.player_name,
        duel.attacker.value,
        duel.defender.player_name,
        duel.defender.condition,
        duel.defender.value,
        duel.goal,
      ]),
    ).toEqual([
      [1, aguias.club.id, 'Otto Rangel', 75, 'Ivo Teles', 'APTO', 72, true],
      [2, aguias.club.id, 'Lauro Neves', 82, 'Hugo Vaz', 'APTO', 84, false],
      [3, aguias.club.id, 'Davi Lins', 63, 'Lino Matos', 'APTO', 63, false],
      [4, delta.club.id, 'Ugo Falcão', 81, 'Rui Prado', 'APTO', 77, true],
      [5, delta.club.id, 'Nei Soares', 70, 'Téo Brandão', 'APTO', 84, false],
      [
        6,
        delta.club.id,
        'Lino Matos',
        79,
        'Davi Lins',
        'MAL_CONDICIONADO',
        56,
        true,
      ],
    ]);

    const cashAfter = await prisma.club.findMany({
      where: { id: { in: [aguias.club.id, delta.club.id] } },
      select: { id: true, cash: true },
      orderBy: { id: 'asc' },
    });
    expect(cashAfter).toEqual(cashBefore);
    const lineup = await request(app.getHttpServer())
      .get(`/api/v1/clubs/${aguias.club.id}/lineup`)
      .expect(200);
    expect(lineup.body).toMatchObject({ complete: true });
    const davi = await request(app.getHttpServer())
      .get(`/api/v1/players/${aguias.players[1].id}`)
      .expect(200);
    expect(davi.body).toMatchObject({ dribbling: 74, defending: 66 });
  });

  it('consulta a partida com os 6 duelos, sem mudar depois de editar, vender ou mudar a condição', async () => {
    const aguias = await createTeam(aguiasSquad);
    const delta = await createTeam(deltaSquad);
    const response = await play({
      home_club_id: aguias.club.id,
      away_club_id: delta.club.id,
    }).expect(201);
    const played = response.body as MatchDetailsResponse;

    await request(app.getHttpServer())
      .put(`/api/v1/players/${aguias.players[4].id}`)
      .send({ name: 'Outro Nome', position: 'ATA', agility: 60, age: 25 })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/v1/players/${aguias.players[1].id}/condition`)
      .send({ condition: 'APTO' })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/v1/players/${delta.players[4].id}/sell`)
      .expect(200);

    const found = await getMatch(played.id).expect(200);
    expect(found.body).toEqual(played);
  });

  it('responde 404 para partida inexistente', async () => {
    for (const id of ['2147483647', '0', '01', 'abc']) {
      const response = await getMatch(id).expect(404);
      expect(response.body).toHaveProperty('message');
    }
  });

  describe('GET /matches', () => {
    it('lista sem os duelos, da mais recente para a mais antiga, e filtra pelo clube', async () => {
      const aguias = await createTeam(aguiasSquad);
      const delta = await createTeam(deltaSquad);
      const gama = await createTeam(deltaSquad);
      const first = await play({
        home_club_id: aguias.club.id,
        away_club_id: delta.club.id,
      }).expect(201);
      const second = await play({
        home_club_id: gama.club.id,
        away_club_id: aguias.club.id,
      }).expect(201);
      const third = await play({
        home_club_id: delta.club.id,
        away_club_id: gama.club.id,
      }).expect(201);
      const ids = (body: unknown) =>
        (body as MatchDetailsResponse[]).map((match) => match.id);

      const all = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .expect(200);
      const ours = (all.body as MatchDetailsResponse[]).filter((match) =>
        [first, second, third].some(
          (r) => (r.body as MatchDetailsResponse).id === match.id,
        ),
      );
      expect(ours.map((match) => match.id)).toEqual(
        [third, second, first].map((r) => (r.body as MatchDetailsResponse).id),
      );
      const { duels, ...summary } = first.body as MatchDetailsResponse;
      expect(duels).toHaveLength(6);
      expect(ours[2]).toEqual(summary);

      const filtered = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .query({ club_id: String(aguias.club.id) })
        .expect(200);
      expect(ids(filtered.body)).toEqual(
        [second, first].map((r) => (r.body as MatchDetailsResponse).id),
      );
    });

    it('devolve lista vazia para clube sem partidas', async () => {
      const club = await createClub();

      const response = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .query({ club_id: String(club.id) })
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it.each(['01', '0', '-1', 'abc', ''])(
      'recusa com 400 o club_id %j',
      async (clubId) => {
        await request(app.getHttpServer())
          .get('/api/v1/matches')
          .query({ club_id: clubId })
          .expect(400);
      },
    );

    it('responde 404 para clube inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .query({ club_id: '2147483647' })
        .expect(404);
    });
  });

  describe('GET /standings', () => {
    it('inclui todos os clubes, com posições de 1 ao total, e conta pontos e gols', async () => {
      const aguias = await createTeam(aguiasSquad);
      const delta = await createTeam(deltaSquad);
      const idle = await createClub();
      await play({
        home_club_id: aguias.club.id,
        away_club_id: delta.club.id,
      }).expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/v1/standings')
        .expect(200);
      const standings = response.body as StandingResponse[];

      expect(standings).toHaveLength(await prisma.club.count());
      expect(standings.map((row) => row.position)).toEqual(
        standings.map((_, index) => index + 1),
      );
      const row = (clubId: number) =>
        standings.find((standing) => standing.club_id === clubId)!;
      expect(row(delta.club.id)).toEqual({
        position: expect.any(Number) as number,
        club_id: delta.club.id,
        club_name: delta.club.name,
        played: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goals_for: 2,
        goals_against: 1,
        goal_difference: 1,
        points: 3,
      });
      expect(row(aguias.club.id)).toMatchObject({
        played: 1,
        losses: 1,
        goals_for: 1,
        goals_against: 2,
        goal_difference: -1,
        points: 0,
      });
      expect(row(idle.id)).toMatchObject({ played: 0, points: 0 });
      expect(row(delta.club.id).position).toBeLessThan(row(idle.id).position);
      expect(row(idle.id).position).toBeLessThan(row(aguias.club.id).position);
    });
  });

  it('permite repetir o confronto', async () => {
    const aguias = await createTeam(aguiasSquad);
    const delta = await createTeam(deltaSquad);
    const body = { home_club_id: aguias.club.id, away_club_id: delta.club.id };

    await play(body).expect(201);
    await play(body).expect(201);
  });

  it('recusa com 409 clube sem escalação ou com escalação incompleta, sem gravar', async () => {
    const aguias = await createTeam(aguiasSquad);
    const delta = await createTeam(deltaSquad, false);

    await play({
      home_club_id: aguias.club.id,
      away_club_id: delta.club.id,
    }).expect(409);

    await request(app.getHttpServer())
      .post(`/api/v1/players/${aguias.players[4].id}/sell`)
      .expect(200);
    const other = await createTeam(deltaSquad);
    const response = await play({
      home_club_id: other.club.id,
      away_club_id: aguias.club.id,
    }).expect(409);
    expect(response.body).toHaveProperty('message');

    expect(
      await prisma.match.count({
        where: {
          OR: [
            { homeClubId: { in: clubIds } },
            { awayClubId: { in: clubIds } },
          ],
        },
      }),
    ).toBe(0);
  });

  it('responde 404 para clube inexistente', async () => {
    const club = await createClub();

    await play({ home_club_id: club.id, away_club_id: 2147483647 }).expect(404);
    await play({ home_club_id: 2147483647, away_club_id: club.id }).expect(404);
  });

  it.each([
    [{}],
    [{ home_club_id: 1 }],
    [{ home_club_id: 1, away_club_id: 1 }],
    [{ home_club_id: '1', away_club_id: 2 }],
    [{ home_club_id: 0, away_club_id: 2 }],
    [{ home_club_id: 1, away_club_id: 2.5 }],
    [[]],
  ])('recusa com 400 o corpo %j', async (body) => {
    await play(body).expect(400);
  });
});
