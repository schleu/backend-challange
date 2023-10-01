import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from 'src/wallet/wallet.service';
import { UsersService } from 'src/users/users.service';
import axios from 'axios';
import {} from '@nestjs/axios';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly user: UsersService,
  ) {}

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

  async transaction(data: {
    receive_wallet_id: string;
    sender_wallet_id: string;
    amount: number;
  }) {
    const senderWallet = await this.wallet.getWallet({
      id: data.sender_wallet_id,
    });

    const userSender = await this.user.getUser({ id: senderWallet.userId });

    if (userSender.role === 'TRADESMAN')
      return UnauthorizedException.createBody({
        message: 'Usuários com a role `TRADESMAN` não pode enviar dinheiro.',
        statusCode: 400,
      });

    if (senderWallet.amount < data.amount)
      return HttpException.createBody({
        message: `Saldo não disponível.`,
        statusCode: 400,
      });

    let transaction;
    try {
      transaction = await this.create({
        amount: data.amount,
        receive_wallet: { connect: { id: data.receive_wallet_id } },
        sender_wallet: { connect: { id: data.sender_wallet_id } },
      });
    } catch (error) {
      return HttpException.createBody({ message: '', statusCode: 400 });
    }

    const authorization = await axios.request({
      method: 'GET',
      url: 'https://run.mocky.io/v3/48f7d5a7-50d9-4470-94c0-2a19a85426ff',
      headers: {
        Accept: 'application/json',
      },
    });

    try {
      this.update({ status: 'IN_PROGRESS' }, { id: transaction.id });
    } catch (error) {
      return HttpException.createBody({ message: '', statusCode: 400 });
    }

    if (authorization.data.message !== 'Autorizado') {
      this.update({ status: 'FAILED' }, { id: transaction.id });

      return UnauthorizedException.createBody({
        message: 'Transferencia não autorizada.',
        statusCode: 400,
      });
    }

    const transfer = await this.wallet.transfer(
      data.amount,
      data.sender_wallet_id,
      data.receive_wallet_id,
    );

    if (!transfer[0].id || !transfer[1].id) {
      this.update({ status: 'FAILED' }, { id: transaction.id });

      return HttpException.createBody({
        message: 'Ocorreu um erro inesperado.',
        statusCode: 400,
      });
    }

    await axios.post('https://v4ew7.wiremockapi.cloud/notify', {
      Body: {
        transaction,
      },
    });

    const updatedTransaction = this.update(
      { status: 'SUCCESS' },
      { id: transaction.id },
    );
    return updatedTransaction;
  }
}
