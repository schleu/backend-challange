import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionService } from './transaction/transaction.service';
import { UsersModule } from './users/users.module';
import { WalletService } from './wallet/wallet.service';

@Module({
  controllers: [AppController, TransactionController],
  imports: [UsersModule, PrismaModule, TransactionModule],
  providers: [AppService, PrismaService, WalletService, TransactionService],
})
export class AppModule {}
