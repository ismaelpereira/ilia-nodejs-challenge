import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { FirebaseConnection } from 'src/utils/firebase/firebase';
import { AuthDTO } from './dto/auth.dto';
import { FirebaseResponse } from './entity/signIn.entity';

describe('AuthService', () => {
  const configService = mockDeep<ConfigService>();
  const firebase = mockDeep<FirebaseConnection>();

  const service = new AuthService(configService, firebase);

  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('login', () => {
    it('should authenticate user, fetch firebase user and return JWT', async () => {
      const dto: AuthDTO = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const firebaseApiResponse: FirebaseResponse = {
        localId: faker.string.uuid(),
      };

      const firebaseUser = {
        uid: firebaseApiResponse.localId,
      };

      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'FIREBASE_API_KEY') return 'firebase-api-key';
        if (key === 'JWT_PRIVATE_KEY') return 'jwt-private-key';
        return undefined;
      });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(firebaseApiResponse),
      } as any);

      firebase.getUser.mockResolvedValueOnce(firebaseUser as any);

      const signSpy = jest.spyOn(jwt, 'sign');

      const result = await service.login(dto);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('signInWithPassword'),
        expect.objectContaining({
          method: 'POST',
        }),
      );

      expect(firebase.getUser).toHaveBeenCalledWith(
        firebaseApiResponse.localId,
      );

      expect(signSpy).toHaveBeenCalledWith(
        {
          sub: firebaseUser.uid,
        },
        'jwt-private-key',
        expect.objectContaining({
          expiresIn: '24h',
          issuer: 'users-ms',
        }),
      );

      expect(result).toEqual({
        user: {
          id: firebaseUser.uid,
          first_name: '',
          last_name: '',
          email: '',
        },
        access_token: expect.any(String),
      });
    });

    it('should throw error when firebase authentication fails', async () => {
      const dto: AuthDTO = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      configService.getOrThrow.mockReturnValue('firebase-api-key');

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
      } as any);

      await expect(service.login(dto)).rejects.toThrow('Authentication failed');
    });
  });

  describe('signInternalJwt', () => {
    it('should sign an internal JWT', () => {
      const payload = { service: 'wallet' };

      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'JWT_INTERNAL_KEY') return 'internal-key';
        return undefined;
      });

      const signSpy = jest.spyOn(jwt, 'sign');

      service.signInternalJwt(payload);

      expect(signSpy).toHaveBeenCalledWith(
        payload,
        'internal-key',
        expect.objectContaining({
          expiresIn: '5m',
          issuer: 'internal',
        }),
      );
    });
  });
});
