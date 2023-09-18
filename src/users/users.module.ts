import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { WalletController } from 'src/wallet/wallet.controller';

@Global()
@Module({
  controllers: [UsersController, WalletController],
  providers: [UsersService, WalletService],
  exports: [UsersService],
})
export class UsersModule {}
