import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { AuthDTO } from './dto/auth.dto';
import { AuthResponseDTO } from './dto/authResponse.dto';

describe('AuthController', () => {
  const authService = mockDeep<AuthService>();
  const controller = new AuthController(authService);

  describe('login', () => {
    it('should call AuthService.login and return AuthResponseDTO', async () => {
      const dto: AuthDTO = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const response: AuthResponseDTO = {
        user: {
          id: faker.string.uuid(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: dto.email,
        },
        access_token: faker.string.alphanumeric(64),
      };

      authService.login.mockResolvedValueOnce(response);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });
});
