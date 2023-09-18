import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { WalletService } from '../wallet/wallet.service';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly appService: UsersService,
    private walletService: WalletService,
  ) {}

  @Get('/users/:id')
  async getUser(@Param('id') id: string, @Res() res): Promise<User> {
    if (!id)
      return res.status(400).send({
        message: 'id not found',
      });

    const data = await this.appService.getUser({ id });
    return res.status(200).send(data);
  }

  @Get('/users')
  async getUsers(@Res() res) {
    const data = await this.appService.getUsers();
    return res.status(200).send({
      status: 200,
      data,
    });
  }

  @Post('/users')
  async posUsers(
    @Body() userData: Prisma.UserCreateInput,
    @Res() res,
  ): Promise<User> {
    if (
      userData.role &&
      userData.role !== 'TRADESMAN' &&
      userData.role !== 'USER'
    ) {
      return res.status(400).send({
        status: 400,
        message: 'Role não existente.',
      });
    }

    Object.keys(userData).forEach((key) => {
      if (!userData[key])
        return res.status(400).send({
          status: 400,
          message: `${key} não existente.`,
        });
    });

    const user = await this.appService.create(userData);

    const wallet = await this.walletService.create({
      user: {
        connect: {
          id: user.id,
        },
      },
    });

    return res.status(200).send({
      status: 200,
      data: {
        ...user,
        wallet,
      },
    });
  }

  @Delete('/users/:id')
  async deleteUser(
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.appService.update(data, { id });
  }

  @Patch('/users/:id')
  async updateUser(@Param('id') id: string): Promise<User> {
    return this.appService.delete({ id });
  }
}
