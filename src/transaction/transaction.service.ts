import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        receive_wallet: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            user: true,
          },
        },
        sender_wallet: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            user: true,
          },
        },
      },
    });
  }

  async findAllById(where: Prisma.TransactionWhereUniqueInput) {
    return this.prisma.transaction.findMany({
      where,
      include: {
        receive_wallet: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            user: true,
          },
        },
        sender_wallet: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            user: true,
          },
        },
      },
    });
  }
}
