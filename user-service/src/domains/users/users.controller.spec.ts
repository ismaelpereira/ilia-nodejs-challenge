import { NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { mockDeep } from 'jest-mock-extended';

import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserRequestDTO } from './dto/userRequest.dto';
import { User } from '@prisma/user-client';

describe('UserController', () => {
  const userService = mockDeep<UserService>();
  const controller = new UserController(userService);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should call userService.create with body', async () => {
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      userService.create.mockResolvedValueOnce(undefined);

      const result = await controller.createUser(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toBeUndefined();
    });
  });

  describe('getUsers', () => {
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

      userService.getAll.mockResolvedValueOnce(users);

      const result = await controller.getUsers();

      expect(userService.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user: User = {
        id: faker.number.int(),
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        created_at: faker.date.past(),
      };

      userService.getOne.mockResolvedValueOnce(user);

      const result = await controller.getUserById(user.id);

      expect(userService.getOne).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const id = faker.number.int();

      userService.getOne.mockResolvedValueOnce(null);

      await expect(controller.getUserById(id)).rejects.toThrow(
        new NotFoundException(`User with id ${id} not found`),
      );

      expect(userService.getOne).toHaveBeenCalledWith(id);
    });
  });

  describe('updateUser', () => {
    it('should call userService.update with id and body', async () => {
      const id = faker.number.int();
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      userService.update.mockResolvedValueOnce(undefined);

      const result = await controller.updateUser(id, dto);

      expect(userService.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteUser', () => {
    it('should call userService.delete with id', async () => {
      const id = faker.number.int();

      userService.delete.mockResolvedValueOnce(undefined);

      const result = await controller.deleteUser(id);

      expect(userService.delete).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});
