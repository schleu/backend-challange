import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const fakeWallets = [
  {
    id: '5c17d90d-a654-4f50-976a-91e33f306bbb',
    userId: '8594c8c1-9f46-4579-bef4-23cea1d1bb64',
    amount: 198000,
    createdAt: '2023-09-18T00:06:05.183Z',
    updatedAt: '2023-09-22T20:30:42.682Z',
    user: {
      id: '8594c8c1-9f46-4579-bef4-23cea1d1bb64',
      name: 'Danilo',
      lastName: 'Schleu',
      email: 'daniloschleu@gmail.com',
      document: '05281311506',
      password: '1234',
      role: 'USER',
      createdAt: '2023-09-18T00:06:05.155Z',
      updatedAt: '2023-09-18T00:06:05.155Z',
      deletedAt: '2023-09-18T00:06:05.155Z',
    },
  },
  {
    id: '6bef4078-6a86-4bf2-b458-203cc77a0753',
    userId: '1dbcb936-03e7-42e4-a9cf-c6aa8b25d84f',
    amount: 2200,
    createdAt: '2023-09-18T23:43:45.644Z',
    updatedAt: '2023-09-22T20:30:42.682Z',
    user: {
      id: '1dbcb936-03e7-42e4-a9cf-c6aa8b25d84f',
      name: 'Bradesco',
      lastName: 'ltda',
      email: 'bradesco@gmail.com',
      document: '05281311501',
      password: '1234',
      role: 'TRADESMAN',
      createdAt: '2023-09-18T23:43:45.582Z',
      updatedAt: '2023-09-18T23:43:45.582Z',
      deletedAt: '2023-09-18T23:43:45.582Z',
    },
  },
];

const prismaMock = {
  wallet: {
    create: jest.fn().mockReturnValue(fakeWallets[0]),
    findMany: jest.fn().mockResolvedValue(fakeWallets),
    findUnique: jest.fn().mockResolvedValue(fakeWallets[0]),
    update: jest.fn().mockResolvedValue(fakeWallets[0]),
    delete: jest.fn(), // O método delete não retorna nada
  },
};

describe('WallerService', () => {
  let service: WalletService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = app.get<WalletService>(WalletService);
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('FindAll', () => {
    it('should return all wallets ', async () => {
      const response = await service.getAllWallets();

      expect(response).toEqual(fakeWallets);
      expect(prisma.wallet.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('FindOne', () => {
    it('should return a single wallet', async () => {
      const response = await service.getWallet({ id: fakeWallets[0].id });

      expect(response).toEqual(fakeWallets[0]);
      expect(prisma.wallet.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wallet.findUnique).toHaveBeenCalledWith({
        where: { id: fakeWallets[0].id },
      });
    });

    it('should return nothinf waller is not found', async () => {
      jest.spyOn(prisma.wallet, 'findUnique').mockResolvedValue(undefined);

      const respose = await service.getWallet({ id: '1' });

      expect(respose).toBeUndefined();
    });
  });

  describe('Create', () => {
    it('should create a new wallet', async () => {
      const response = await service.create({
        amount: 0,
        user: {
          connect: {
            id: '8594c8c1-9f46-4579-bef4-23cea1d1bb64',
          },
        },
      });

      expect(response).toEqual(fakeWallets[0]);
      expect(prisma.wallet.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update', () => {
    it('should be able update a single wallet', async () => {
      const response = await service.update({ amount: 20 }, { id: '' });

      expect(response).toEqual(fakeWallets[0]);
      expect(prisma.wallet.update).toHaveBeenCalledTimes(1);
    });

    it('should be able update a single wallet', async () => {
      jest
        .spyOn(prisma.wallet, 'update')
        .mockRejectedValue(new NotFoundException());

      const updateData = { amount: 20 };

      try {
        await service.update(updateData, { id: '1' });
      } catch (error) {
        expect(error).toEqual(new NotFoundException());
      }

      expect(prisma.wallet.update).toHaveBeenCalledTimes(1);
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });
  });

  describe('Transaction', () => {
    it('should be able to deposit money', async () => {
      const amountDeposited = 200;

      jest.spyOn(prisma.wallet, 'findUnique').mockResolvedValue({
        amount: fakeWallets[0].amount,
        id: fakeWallets[0].id,
        userId: fakeWallets[0].userId,
        createdAt: new Date(fakeWallets[0].createdAt),
        updatedAt: new Date(fakeWallets[0].updatedAt),
      });

      jest.spyOn(prisma.wallet, 'update').mockResolvedValue({
        amount: fakeWallets[0].amount + amountDeposited,
        id: fakeWallets[0].id,
        userId: fakeWallets[0].userId,
        createdAt: new Date(fakeWallets[0].createdAt),
        updatedAt: new Date(fakeWallets[0].updatedAt),
      });

      await service.deposit(amountDeposited, fakeWallets[0].id);

      expect(prisma.wallet.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wallet.update).toHaveBeenCalledTimes(1);
    });

    // it('should be able transaction amount wallet', async () => {
    //   const transferAmount = 20;
    //   jest.spyOn(prisma.wallet, 'findUnique').mockResolvedValue({
    //     amount: fakeWallets[0].amount,
    //     id: fakeWallets[0].id,
    //     userId: fakeWallets[0].userId,
    //     createdAt: new Date(fakeWallets[0].createdAt),
    //     updatedAt: new Date(fakeWallets[0].updatedAt),
    //   });

    //   jest.spyOn(prisma.wallet, 'update').mockResolvedValue({
    //     amount: fakeWallets[0].amount,
    //     id: fakeWallets[0].id,
    //     userId: fakeWallets[0].userId,
    //     createdAt: new Date(fakeWallets[0].createdAt),
    //     updatedAt: new Date(fakeWallets[0].updatedAt),
    //   });

    //   jest.spyOn(prisma.wallet, '').mockResolvedValue({
    //     amount: fakeWallets[0].amount,
    //     id: fakeWallets[0].id,
    //     userId: fakeWallets[0].userId,
    //     createdAt: new Date(fakeWallets[0].createdAt),
    //     updatedAt: new Date(fakeWallets[0].updatedAt),
    //   });

    //   const response = await service.transfer(
    //     transferAmount,
    //     fakeWallets[0].id,
    //     fakeWallets[1].id,
    //   );

    //   console.log(response);
    // });
  });
});
