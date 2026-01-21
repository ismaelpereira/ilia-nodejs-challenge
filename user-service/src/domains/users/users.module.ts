import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { UserController } from './users.controller';
import { PrismaModule } from 'src/utils/prisma/prisma.module';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { PrismaWalletService } from 'src/utils/prisma/prismaWallet.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, PrismaWalletService],
})
export class UserModule {}
