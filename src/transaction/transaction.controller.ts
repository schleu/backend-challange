import { Body, Controller, Post, Res } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private user: UsersService,
    private wallet: WalletService,
  ) {}

  @Post('/transfer')
  async makeTransfer(@Body() data: Prisma.TransactionCreateInput, @Res() res) {
    const sender = await this.wallet.getWallet({
      userId: data.sender_wallet_id,
    });

    const userSender = await this.user.getUser({ id: sender.id });

    if (userSender.role === 'TRADESMAN')
      return res.status(400).send({
        message: 'Usuários com a role `TRADESMAN` não pode enviar dinheiro.',
      });

    if (sender.amount < 1)
      return res.status(400).send({
        message: 'Não tem dinheiro',
      });

    const receive = await this.wallet.getWallet({
      userId: data.receive_wallet_id,
    });

    this.wallet.deposit(data.amount, receive.id);
    this.wallet.withdraw(data.amount, sender.id);

    const transaction = await this.transactionService.create(data);

    return res.status(200).send(transaction);
  }
}
