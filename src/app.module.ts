import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionModule } from './transaction/transaction.module';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  imports: [UsersModule, PrismaModule, TransactionModule],
  providers: [AppService],
})
export class AppModule {}
