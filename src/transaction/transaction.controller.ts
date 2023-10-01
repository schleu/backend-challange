import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/transaction')
  async makeTransfer(
    @Body()
    data: {
      receive_wallet_id: string;
      sender_wallet_id: string;
      amount: number;
    },
  ) {
    try {
      return this.transactionService.transaction({
        amount: data.amount,
        receive_wallet_id: data.receive_wallet_id,
        sender_wallet_id: data.sender_wallet_id,
      });
    } catch (error) {
      return error;
    }
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
