import { Controller, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('/wallet')
  async wallets() {
    return this.walletService.getAllWallets();
  }
}
