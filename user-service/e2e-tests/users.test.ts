import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/utils/prisma/prisma.service';
import { PrismaWalletService } from '../src/utils/prisma/prismaWallet.service';
import { truncateAllTables } from './utils/truncateAllTables';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthenticationGuardStub } from './utils/stubs/authentication.guard.stub';
import { FirebaseConnection } from 'src/utils/firebase/firebase';
import { mockDeep } from 'jest-mock-extended';


describe('Users APIs (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let walletPrisma: PrismaWalletService;
  const firebaseMock = mockDeep<FirebaseConnection>();


  const uuid = '1JRw65yPiba1VRXbTPqPH5tgB2N2';

  beforeAll(async () => {
    jest.setTimeout(50000);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthenticationGuard)
      .useClass(AuthenticationGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    walletPrisma = app.get(PrismaWalletService);
  });

  afterEach(async () => {
    await truncateAllTables(walletPrisma, ['public']);
    await truncateAllTables(prisma, ['public']);

    jest.resetAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /users', () => {
    it('should create user and wallet', async () => {
      const body = {
        email: 'test@e2e.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = await request(app.getHttpServer())
        .post('/users')
        .set('bankuish-authorization', `Bearer token`)
        .send(body);

      expect(result.status).toBe(201);

      const user = await prisma.user.findFirstOrThrow({
        where: { email: body.email },
      });

      const wallet = await walletPrisma.wallet.findFirstOrThrow({
        where: { user_id: user.id },
      });

      expect(user.email).toEqual(body.email);
      expect(user.first_name).toEqual(body.first_name);
      expect(user.last_name).toEqual(body.last_name);
      expect(wallet.balance).toEqual(0);
    });
  });

  describe('GET /users', () => {
    it('should return list of users', async () => {
      await prisma.user.createMany({
        data: [
          {
            email: 'test@e2e.com',
            first_name: 'John',
            last_name: 'Doe',
          },
          {
            email: 'tes2t@e2e.com',
            first_name: 'Mary',
            last_name: 'Doe',
          },
        ],
      });

      const result = await request(app.getHttpServer())
        .get('/users')
        .set('bankuish-authorization', `Bearer token`);

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(2);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@e2e.com',
          first_name: 'John',
          last_name: 'Doe',
        },
      });

      const result = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('bankuish-authorization', `Bearer token`);

      expect(result.status).toBe(200);
      expect(result.body.email).toEqual(user.email);
    });

    it('should return 404 if user does not exist', async () => {
      const result = await request(app.getHttpServer())
        .get('/users/9999')
        .set('bankuish-authorization', `Bearer token`);

      expect(result.status).toBe(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user data', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@e2e.com',
          first_name: 'John',
          last_name: 'Doe',
        },
      });

      const body = {
        email: 'test1@e2e.com',
        first_name: 'Mary',
        last_name: 'Doe',
      };

      const result = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set('bankuish-authorization', `Bearer token`)
        .send(body);

      expect(result.status).toBe(200);

      const updatedUser = await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
      });

      expect(updatedUser.email).toEqual(body.email);
      expect(updatedUser.first_name).toEqual(body.first_name);
      expect(updatedUser.last_name).toEqual(body.last_name);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@e2e.com',
          first_name: 'John',
          last_name: 'Doe',
        },
      });

      const result = await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('bankuish-authorization', `Bearer token`);

      expect(result.status).toBe(200);

      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser).toBeNull();
    });
  });
});
