import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TransactionCreateInput) {
    return this.prisma.transaction.create({ data });
  }

  async update(
    data: Prisma.TransactionUpdateInput,
    where: Prisma.TransactionWhereUniqueInput,
  ) {
    return this.prisma.transaction.update({ data, where });
  }
}
