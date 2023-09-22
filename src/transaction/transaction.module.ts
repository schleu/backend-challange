import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WalletController } from 'src/wallet/wallet.controller';
import { WalletService } from 'src/wallet/wallet.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  controllers: [TransactionController, WalletController],
  providers: [TransactionService, WalletService],
  exports: [TransactionService],
  imports: [HttpModule],
})
export class TransactionModule {}
