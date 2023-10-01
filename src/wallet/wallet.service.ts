import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Wallet } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getAllWallets(): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      include: {
        user: true,
      },
    });
  }

  async getWallet(where: Prisma.WalletWhereUniqueInput): Promise<Wallet> {
    return this.prisma.wallet.findUnique({ where });
  }

  async create(data: Prisma.WalletCreateInput) {
    return this.prisma.wallet.create({ data });
  }

  async update(
    data: Prisma.WalletUpdateInput,
    where: Prisma.WalletWhereUniqueInput,
  ) {
    return this.prisma.wallet.update({ data, where });
  }

  async deposit(value: number, id: string) {
    const w = await this.getWallet({ id: id, userId: id });
    const amount = w.amount + value;
    return this.update({ amount }, { id: w.id });
  }

  async withdraw(value: number, id: string) {
    const w = await this.getWallet({ id: id, userId: id });
    const amount = w.amount - value;
    return this.update({ amount }, { id: w.id });
  }

  async transfer(amount: number, idSender: string, idReceive: string) {
    const userW = await this.getWallet({ id: idSender });

    if (userW.amount < amount)
      return BadRequestException.createBody({
        message: 'Não possui saldo suficiente.',
      });

    const withdraw = this.prisma.wallet.update({
      data: { amount: userW.amount - amount },
      where: { id: idSender },
    });

    const userD = await this.getWallet({ id: idReceive });
    const deposit = this.prisma.wallet.update({
      data: { amount: userD.amount + amount },
      where: { id: idReceive },
    });

    return this.prisma.$transaction([withdraw, deposit]);
  }
}
