import { Body, Controller, Get, Post, Res, Param } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { TransactionService } from './transaction.service';

@Controller('')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private user: UsersService,
    private wallet: WalletService,
  ) {}

  @Post('/transfer')
  async makeTransfer(@Body() data: Prisma.TransactionCreateInput, @Res() res) {
    const senderWallet = await this.wallet.getWallet({
      id: data.sender_wallet.connect.id,
    });

    const userSender = await this.user.getUser({ id: senderWallet.userId });

    if (userSender.role === 'TRADESMAN')
      return res.status(400).send({
        message: 'Usuários com a role `TRADESMAN` não pode enviar dinheiro.',
      });

    if (senderWallet.amount < data.amount)
      return res.status(400).send({
        message: `Saldo inferior a ${data.amount}`,
      });

    const transaction = await this.transactionService.create(data);

    const authorization = await axios.request({
      method: 'GET',
      url: 'https://run.mocky.io/v3/48f7d5a7-50d9-4470-94c0-2a19a85426ff',
      headers: {
        Accept: 'application/json',
      },
    });

    this.transactionService.update(
      { status: 'IN_PROGRESS' },
      { id: transaction.id },
    );

    if (authorization.data.message !== 'Autorizado') {
      this.transactionService.update(
        { status: 'FAILED' },
        { id: transaction.id },
      );

      return res.status(400).send({
        message: 'Transferencia não autorizada.',
      });
    }

    const transfer = await this.wallet.transfer(
      data.amount,
      data.sender_wallet.connect.id,
      data.receive_wallet.connect.id,
    );

    if (!transfer[0].id || !transfer[1].id) {
      this.transactionService.update(
        { status: 'FAILED' },
        { id: transaction.id },
      );

      return res.status(400).send({
        message: 'Ocorreu um erro inesperado.',
      });
    }

    await axios.post('https://v4ew7.wiremockapi.cloud/notify', {
      Body: {
        transaction,
      },
    });

    this.transactionService.update(
      { status: 'SUCCESS' },
      { id: transaction.id },
    );

    return res.status(200).send(transaction);
  }

  @Get('/transaction/:id')
  async transaction(@Param('id') id: string) {
    console.log(id);
    return this.transactionService.findAllById({ id });
  }

  @Get('/transaction')
  async transactionAll() {
    return this.transactionService.findAll();
  }
}
