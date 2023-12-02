import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersModule } from './../src/modules/user/user.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const dummy_username: string = 'demo_user';
  const dummy_password: string = 'demo_user'

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth (POST) success', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth')
      .send({ username: dummy_username, password: dummy_password })
      .expect(201);
  })

  it('/auth (POST) failed first time', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({ username: dummy_username, password: 'random' })
      .expect(401)
  })

  it('/auth (POST) failed second time', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({ username: dummy_username, password: 'random' })
      .expect(401)
  })

  it('/auth (POST) failed third time', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({ username: dummy_username, password: 'random' })
      .expect(401)
  })

  it('/auth (POST) failed account locked', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({ username: dummy_username, password: 'random' })
      .expect(403)
  })



  afterAll(async () => {
    await app.close();
  })
});

