import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

interface ErrorBody {
  message: unknown;
}

describe('Convenções da API (e2e)', () => {
  let app: INestApplication<App>;
  let allowedOrigin: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    allowedOrigin = app.get(ConfigService).getOrThrow<string>('CORS_ORIGIN');
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 404 em JSON com message para um caminho inexistente', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/inexistente')
      .expect(404)
      .expect('Content-Type', /application\/json/);

    expect(typeof (response.body as ErrorBody).message).toBe('string');
  });

  it('responde 400 em JSON com message para um corpo que não é JSON válido', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/inexistente')
      .set('Content-Type', 'application/json')
      .send('{"a":')
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(typeof (response.body as ErrorBody).message).toBe('string');
  });

  it('libera o CORS para a origem do frontend', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/inexistente')
      .set('Origin', allowedOrigin);

    expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
  });

  it('não libera o CORS para outra origem', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/inexistente')
      .set('Origin', 'http://outra-origem.test');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
