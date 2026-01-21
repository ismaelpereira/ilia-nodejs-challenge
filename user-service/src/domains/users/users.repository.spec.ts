import { UserRepository } from './users.repository';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { PrismaWalletService } from 'src/utils/prisma/prismaWallet.service';
import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { UserRequestDTO } from './dto/userRequest.dto';
import { User } from '@prisma/user-client';

describe('UserRepository', () => {
  const prisma = mockDeep<PrismaService>();
  const walletPrisma = mockDeep<PrismaWalletService>();

  const repository = new UserRepository(prisma, walletPrisma);

  describe('create', () => {
    it('should create user and wallet successfully', async () => {
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      const user: User = {
        id: faker.number.int({ min: 1 }),
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        created_at: new Date(),
      };

      prisma.user.create.mockResolvedValueOnce(user);
      walletPrisma.wallet.create.mockResolvedValueOnce({} as any);

      const result = await repository.create(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          first_name: dto.first_name,
          last_name: dto.last_name,
        },
      });

      expect(walletPrisma.wallet.create).toHaveBeenCalledWith({
        data: { user_id: user.id },
      });

      expect(result).toEqual(user);
    });

    it('should rollback user creation if wallet creation fails', async () => {
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      const user: User = {
        id: faker.number.int({ min: 1 }),
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        created_at: new Date(),
      };

      prisma.user.create.mockResolvedValueOnce(user);
      walletPrisma.wallet.create.mockRejectedValueOnce(
        new Error('Wallet creation failed'),
      );

      prisma.user.delete.mockResolvedValueOnce(user);

      await expect(repository.create(dto)).rejects.toThrow(
        'Wallet creation failed',
      );

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should throw rollback error if user delete fails', async () => {
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      const user: User = {
        id: faker.number.int({ min: 1 }),
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        created_at: new Date(),
      };

      prisma.user.create.mockResolvedValueOnce(user);
      walletPrisma.wallet.create.mockRejectedValueOnce(
        new Error('Wallet creation failed'),
      );

      prisma.user.delete.mockRejectedValueOnce(
        new Error('Delete failed'),
      );

      await expect(repository.create(dto)).rejects.toThrow(
        'Failed to rollback user creation after wallet creation failure',
      );
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const users: User[] = Array.from({ length: 3 }).map(() => ({
        id: faker.number.int({ min: 1 }),
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        created_at: new Date(),
      }));

      prisma.user.findMany.mockResolvedValueOnce(users);

      const result = await repository.getAll();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('getOne', () => {
    it('should return a user when found', async () => {
      const user: User = {
        id: faker.number.int({ min: 1 }),
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        created_at: new Date(),
      };

      prisma.user.findUnique.mockResolvedValueOnce(user);

      const result = await repository.getOne(user.id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });

      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      const result = await repository.getOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const dto: UserRequestDTO = {
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      prisma.user.update.mockResolvedValueOnce({} as any);

      await repository.update(1, dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          first_name: dto.first_name,
          last_name: dto.last_name,
        },
        where: { id: 1 },
      });
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      prisma.user.delete.mockResolvedValueOnce({} as any);

      await repository.delete(1);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
