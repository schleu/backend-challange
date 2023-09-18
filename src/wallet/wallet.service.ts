import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Wallet } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

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
}
