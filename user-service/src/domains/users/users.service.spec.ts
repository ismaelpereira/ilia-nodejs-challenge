import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { UserRequestDTO } from './dto/userRequest.dto';
import { User } from '@prisma/user-client';

describe('UserService', () => {
  const userRepository = mockDeep<UserRepository>();
  const service = new UserService(userRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call repository.create with correct data', async () => {
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      userRepository.create.mockResolvedValueOnce(undefined as any);

      await service.create(dto);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const users: User[] = [
        {
          id: faker.number.int(),
          email: faker.internet.email(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          created_at: faker.date.past(),
        },
      ];

      userRepository.getAll.mockResolvedValueOnce(users);

      const result = await service.getAll();

      expect(userRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });

  describe('getOne', () => {
    it('should return a user by id', async () => {
      const user: User = {
        id: faker.number.int(),
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        created_at: faker.date.past(),
      };

      userRepository.getOne.mockResolvedValueOnce(user);

      const result = await service.getOne(user.id);

      expect(userRepository.getOne).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(user);
    });

    it('should return null if user does not exist', async () => {
      const id = faker.number.int();

      userRepository.getOne.mockResolvedValueOnce(null);

      const result = await service.getOne(id);

      expect(userRepository.getOne).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should call repository.update with correct params', async () => {
      const id = faker.number.int();
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      userRepository.update.mockResolvedValueOnce(undefined);

      await service.update(id, dto);

      expect(userRepository.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('delete', () => {
    it('should call repository.delete with correct id', async () => {
      const id = faker.number.int();

      userRepository.delete.mockResolvedValueOnce(undefined);

      await service.delete(id);

      expect(userRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
